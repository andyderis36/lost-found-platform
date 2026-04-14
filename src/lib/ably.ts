import * as Ably from 'ably';

/**
 * Ably client for real-time notifications
 * Pub/Sub pattern for sending notifications to users
 */

let ablyClient: Ably.Realtime | null = null;
// let ablyRest: Ably.Rest | null = null; // Unused - reserved for future use

/**
 * Initialize Ably JWT client (server-side)
 */
export function getAblyServer(): Ably.Realtime {
  if (!ablyClient) {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      throw new Error('ABLY_API_KEY environment variable is not set');
    }

    ablyClient = new Ably.Realtime({
      key: apiKey,
      autoConnect: true,
    });
  }
  return ablyClient;
}

/**
 * Get Ably token for client-side authentication
 * Never expose the full API key to the client
 * Uses HTTP REST API directly for token generation
 */
export async function getAblyToken(): Promise<string> {
  try {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      throw new Error('ABLY_API_KEY environment variable is not set');
    }
    
    // Decode API key to get keyName and keySecret
    // Format: keyName:keySecret
    const [keyName, keySecret] = apiKey.split(':');
    if (!keyName || !keySecret) {
      throw new Error('ABLY_API_KEY format invalid');
    }
    
    // Create Basic Auth header
    const auth = Buffer.from(`${keyName}:${keySecret}`).toString('base64');
    
    // Call Ably REST API to request token
    const response = await fetch('https://rest.ably.io/keys/' + keyName + '/requestToken', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: 'notifications-system',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ably API error: ${response.status} - ${errorText}`);
    }
    
    const tokenData = await response.json();
    
    if (!tokenData || !tokenData.token) {
      throw new Error('Failed to generate Ably token: no token in response');
    }
    
    console.log('✅ Ably token generated successfully');
    return tokenData.token;
  } catch (error) {
    console.error('❌ Error generating Ably token:', error);
    throw new Error('Failed to generate Ably token: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Channel naming convention for notifications
 * Pattern: notifications-{userId}
 */
export function getNotificationChannelName(userId: string): string {
  return `notifications-${userId}`;
}

/**
 * Channel naming convention for item scans
 * Pattern: item-scans-{itemId}
 */
export function getItemScanChannelName(itemId: string): string {
  return `item-scans-${itemId}`;
}

/**
 * Publish notification to a user
 */
export async function publishNotification(
  userId: string,
  notificationData: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const client = getAblyServer();
    const channelName = getNotificationChannelName(userId);
    const channel = client.channels.get(channelName);

    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publishChannel: any = channel;
      publishChannel.publish(
        {
          name: 'notification',
          data: notificationData,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    console.log(`[ABLY] Notification published to ${channelName}`, notificationData);
  } catch (error) {
    console.error('[ABLY] Error publishing notification:', error);
    throw error;
  }
}

/**
 * Publish item scan event
 */
export async function publishItemScan(
  itemId: string,
  scanData: {
    qrCode: string;
    location?: { latitude: number; longitude: number };
    scannerName?: string;
    scannerEmail?: string;
    timestamp: Date;
  }
): Promise<void> {
  try {
    const client = getAblyServer();
    const channelName = getItemScanChannelName(itemId);
    const channel = client.channels.get(channelName);

    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publishChannel: any = channel;
      publishChannel.publish(
        {
          name: 'scan',
          data: scanData,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    console.log(`[ABLY] Scan published to ${channelName}`, scanData);
  } catch (error) {
    console.error('[ABLY] Error publishing scan:', error);
    throw error;
  }
}

/**
 * Check if Ably is enabled
 */
export function isAblyEnabled(): boolean {
  return process.env.ENABLE_REALTIME_NOTIFICATIONS === 'true' && !!process.env.ABLY_API_KEY;
}

/**
 * Gracefully handle Ably errors
 */
export function handleAblyError(
  error: unknown,
  context: string = 'Ably operation'
): void {
  if (isAblyEnabled()) {
    console.error(`[ABLY] ${context}:`, error);
  } else {
    console.warn(`[ABLY] Notifications disabled, skipping: ${context}`);
  }
}
