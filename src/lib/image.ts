/**
 * Image utility functions (Vercel-compatible)
 * Uses frontend compression only to avoid Sharp binary issues
 */

/**
 * Get size of base64 image in KB
 */
export function getBase64Size(base64Image: string): number {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const sizeInBytes = (base64Data.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
}

/**
 * Validate image size
 */
export function validateImageSize(base64Image: string, maxSizeKB: number = 1000): boolean {
  const sizeKB = getBase64Size(base64Image);
  return sizeKB <= maxSizeKB;
}
