import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

/**
 * Generate a unique QR code ID
 * Format: LF-XXXXXXXXXX (10 characters)
 */
export function generateQRCodeId(): string {
  return `LF-${nanoid(10)}`;
}

/**
 * Generate QR code as Data URL (for displaying in browser)
 * @param qrCodeId - The unique QR code ID
 * @param baseUrl - Base URL for the scan endpoint
 */
export async function generateQRCodeDataURL(
  qrCodeId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_QR_BASE_URL || 'http://localhost:3000/scan'
): Promise<string> {
  const scanUrl = `${baseUrl}/${qrCodeId}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as Buffer (for server-side operations or downloads)
 * @param qrCodeId - The unique QR code ID
 * @param baseUrl - Base URL for the scan endpoint
 */
export async function generateQRCodeBuffer(
  qrCodeId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_QR_BASE_URL || 'http://localhost:3000/scan'
): Promise<Buffer> {
  const scanUrl = `${baseUrl}/${qrCodeId}`;
  
  try {
    const buffer = await QRCode.toBuffer(scanUrl, {
      width: 300,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Validate QR code ID format
 * @param qrCodeId - The QR code ID to validate
 */
export function isValidQRCodeId(qrCodeId: string): boolean {
  return /^LF-[A-Za-z0-9_-]{10}$/.test(qrCodeId);
}
