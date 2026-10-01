/**
 * Rasterizes any image (including SVGs, object URLs, and data URIs) into a standard JPEG Base64 data URL.
 * Gemini Vision API strictly requires raster formats (image/jpeg, image/png, image/webp) with standard Base64 data.
 */
export async function getRasterizedBase64(src: string): Promise<string> {
  // If it's already a raster base64 (JPEG, PNG, WEBP), return as is
  if (
    src.startsWith('data:image/jpeg;base64,') ||
    src.startsWith('data:image/png;base64,') ||
    src.startsWith('data:image/webp;base64,')
  ) {
    return src;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 600;
        const height = img.naturalHeight || img.height || 500;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Fill background with white in case of transparent SVGs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(jpegUrl);
      } catch (err) {
        console.error('Rasterization to canvas failed:', err);
        resolve(src);
      }
    };

    img.onerror = (err) => {
      console.error('Failed to load image for rasterization:', err);
      resolve(src);
    };

    img.src = src;
  });
}
