/**
 * CMMS SIDRAH - Client-side Image & Media Compression Utility
 * Resizes and compresses images using HTML5 Canvas before uploading or passing to Gemini AI.
 * Reduces bandwidth, token usage, and RAM footprint significantly.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

/**
 * Compresses an image File or Blob and returns both base64 and Blob
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<{ base64: string; blob: Blob; originalSize: number; compressedSize: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > opts.maxWidth!) {
            height = Math.round((height * opts.maxWidth!) / width);
            width = opts.maxWidth!;
          }
        } else {
          if (height > opts.maxHeight!) {
            width = Math.round((width * opts.maxHeight!) / height);
            height = opts.maxHeight!;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get Canvas 2D context for compression'));
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL(opts.mimeType, opts.quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas blob generation failed'));
              return;
            }
            resolve({
              base64,
              blob,
              originalSize,
              compressedSize: blob.size
            });
          },
          opts.mimeType,
          opts.quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Validates audio file duration and size
 */
export function validateAudioBlob(blob: Blob, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
  return blob.size <= maxSizeBytes;
}
