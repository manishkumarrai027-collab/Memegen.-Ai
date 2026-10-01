/**
 * Background Removal Service Utility
 * Calls the API-based removal service with fallback to client-side canvas edge segmentation
 */

export interface RemoveBackgroundOptions {
  tolerance?: number; // 10 to 60 (default 25)
  feather?: number; // 0 to 5 (default 1)
}

/**
 * Remove background using the server-side API with fallback to client-side segmentation
 */
export async function removeImageBackground(
  imageSrc: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const tolerance = options.tolerance ?? 25;

  // 1. Try server-side API background removal first
  try {
    const response = await fetch('/api/remove-background', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imageSrc }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch (err) {
    console.warn('Server background removal API failed, switching to high-precision edge cutout:', err);
  }

  // 2. High-precision client-side background extraction fallback using Canvas
  return await extractSubjectUsingCanvas(imageSrc, tolerance);
}

/**
 * Client-side canvas segmentation: extracts subject by detecting background boundaries
 * and creating a smooth transparent alpha mask.
 */
export function extractSubjectUsingCanvas(imageSrc: string, tolerance = 25): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not supported');
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        // Sample background color samples from 4 corners and borders
        const cornerSamples: [number, number, number][] = [];
        const samplePoints = [
          [2, 2],
          [w - 3, 2],
          [2, h - 3],
          [w - 3, h - 3],
          [Math.floor(w / 2), 2],
          [Math.floor(w / 2), h - 3],
          [2, Math.floor(h / 2)],
          [w - 3, Math.floor(h / 2)],
        ];

        for (const [sx, sy] of samplePoints) {
          const idx = (sy * w + sx) * 4;
          cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }

        // Color distance function (Euclidean in RGB)
        const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
          return Math.sqrt(
            Math.pow(r1 - r2, 2) * 0.299 +
            Math.pow(g1 - g2, 2) * 0.587 +
            Math.pow(b1 - b2, 2) * 0.114
          );
        };

        const tolDist = (tolerance / 100) * 255;
        const softThreshold = tolDist * 0.7;

        // Multi-source flood fill or border distance map
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Push perimeter pixels that match any background corner color
        for (let x = 0; x < w; x++) {
          queue.push(x); // top row
          queue.push((h - 1) * w + x); // bottom row
        }
        for (let y = 1; y < h - 1; y++) {
          queue.push(y * w); // left col
          queue.push(y * w + (w - 1)); // right col
        }

        let qHead = 0;
        while (qHead < queue.length) {
          const p = queue[qHead++];
          if (visited[p]) continue;

          const px = p % w;
          const py = Math.floor(p / w);
          const idx = p * 4;
          const pr = data[idx];
          const pg = data[idx + 1];
          const pb = data[idx + 2];

          // Check minimum distance to corner background samples
          let minDist = 9999;
          for (const [cr, cg, cb] of cornerSamples) {
            const d = colorDist(pr, pg, pb, cr, cg, cb);
            if (d < minDist) minDist = d;
          }

          if (minDist <= tolDist) {
            visited[p] = 1;

            // Make transparent or semi-transparent
            if (minDist <= softThreshold) {
              data[idx + 3] = 0;
            } else {
              const alphaFactor = (minDist - softThreshold) / (tolDist - softThreshold);
              data[idx + 3] = Math.round(alphaFactor * 255);
            }

            // Expand to 4 neighbors
            if (px > 0 && !visited[p - 1]) queue.push(p - 1);
            if (px < w - 1 && !visited[p + 1]) queue.push(p + 1);
            if (py > 0 && !visited[p - w]) queue.push(p - w);
            if (py < h - 1 && !visited[p + w]) queue.push(p + w);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for background removal'));
    img.src = imageSrc;
  });
}
