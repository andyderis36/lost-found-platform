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

    ablyClient = new Ably.Realtime(apiKey);
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

    // Use the Ably REST SDK directly with the full API key.
    // This lets the SDK sign the token request correctly.
    const rest = new (Ably as any).Rest(apiKey) as Ably.Rest;

    // Request a token for the browser client.
    const tokenDetails = await (rest.auth as any).requestToken({
      clientId: 'notifications-system',
    });

    if (!tokenDetails || !tokenDetails.token) {
      throw new Error('Failed to generate Ably token: no token in response');
    }

    console.log('✅ Ably token generated successfully');
    return tokenDetails.token;
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
      const publishChannel: any = channel;
      publishChannel.publish(
        {
          name: 'notification',
          data: notificationData,
        },
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
      const publishChannel: any = channel;
      publishChannel.publish(
        {
          name: 'scan',
          data: scanData,
        },
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
