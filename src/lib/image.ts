import sharp from 'sharp';

/**
 * Compress and resize image from base64 string
 * @param base64Image - Base64 encoded image string
 * @param maxWidth - Maximum width (default: 800px)
 * @param quality - JPEG quality 1-100 (default: 80)
 * @returns Compressed base64 image string
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number = 800,
  quality: number = 80
): Promise<string> {
  try {
    // Extract base64 data and detect format
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const [, , base64Data] = matches;
    const buffer = Buffer.from(base64Data, 'base64');

    // Get original dimensions
    const metadata = await sharp(buffer).metadata();
    
    // Only resize if image is larger than maxWidth
    const shouldResize = metadata.width && metadata.width > maxWidth;

    // Compress and optionally resize
    let sharpInstance = sharp(buffer);
    
    if (shouldResize) {
      sharpInstance = sharpInstance.resize(maxWidth, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to JPEG with quality setting (works best for photos)
    const compressed = await sharpInstance
      .jpeg({ quality, progressive: true })
      .toBuffer();

    // Convert back to base64
    const compressedBase64 = compressed.toString('base64');
    return `data:image/jpeg;base64,${compressedBase64}`;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original image if compression fails
    return base64Image;
  }
}

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
export function validateImageSize(base64Image: string, maxSizeKB: number = 500): boolean {
  const sizeKB = getBase64Size(base64Image);
  return sizeKB <= maxSizeKB;
}
