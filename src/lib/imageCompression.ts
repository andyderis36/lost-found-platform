/**
 * Client-side image compression utilities
 * Compress images in the browser before uploading to API
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  maxSizeKB: 500,
};

/**
 * Compress image file in browser before upload
 * @param file - Image file from input
 * @param options - Compression options
 * @returns Compressed base64 string
 */
export async function compressImageClient(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          
          // Resize if needed
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(
              opts.maxWidth / width,
              opts.maxHeight / height
            );
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels if needed
          let quality = opts.quality;
          let base64 = canvas.toDataURL('image/jpeg', quality);
          let sizeKB = getBase64SizeKB(base64);

          // Reduce quality if still too large
          while (sizeKB > opts.maxSizeKB && quality > 0.1) {
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality);
            sizeKB = getBase64SizeKB(base64);
          }

          console.log(`Image compressed: ${Math.round(file.size / 1024)}KB → ${sizeKB}KB (quality: ${Math.round(quality * 100)}%)`);
          
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get size of base64 string in KB
 */
export function getBase64SizeKB(base64: string): number {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const sizeInBytes = (base64Data.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
}

/**
 * Compress base64 image that's already loaded
 */
export async function compressBase64Image(
  base64Image: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    img.onload = () => {
      try {
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(
            opts.maxWidth / width,
            opts.maxHeight / height
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', opts.quality);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };

    img.src = base64Image;
  });
}
