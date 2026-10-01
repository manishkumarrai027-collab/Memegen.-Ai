import { MemeTextLayer, MemeStickerLayer, MemeFilters, HeaderStyle } from '../types';
import { STICKERS } from '../data/stickers';
import { getFontFamilyCss } from './fontUtils';

export async function exportMemeToCanvas(
  imgElement: HTMLImageElement,
  textLayers: MemeTextLayer[],
  stickers: MemeStickerLayer[],
  filters: MemeFilters,
  headerStyle: HeaderStyle = 'classic'
): Promise<HTMLCanvasElement> {
  // Ensure fonts are loaded before drawing
  if (document.fonts) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context could not be created');
  }

  // Calculate resolution
  const baseWidth = imgElement.naturalWidth || imgElement.width || 800;
  const baseHeight = imgElement.naturalHeight || imgElement.height || 600;

  // Modern banner format adds header area
  const bannerHeight = headerStyle === 'modern-twitter' ? Math.max(120, baseHeight * 0.25) : 0;
  
  canvas.width = baseWidth;
  canvas.height = baseHeight + bannerHeight;

  // Background for banner if modern-twitter
  if (headerStyle === 'modern-twitter') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, bannerHeight);
  }

  // Apply filters on the image
  ctx.save();
  let filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`;
  if (filters.deepFried) {
    filterStr = `contrast(220%) saturate(280%) brightness(110%) sepia(30%)`;
  }
  if (filters.invert) {
    filterStr += ' invert(100%)';
  }
  ctx.filter = filterStr;

  // Draw the image
  ctx.drawImage(imgElement, 0, bannerHeight, baseWidth, baseHeight);
  ctx.restore();

  // Render stickers
  for (const stickerLayer of stickers) {
    const stickerDef = STICKERS.find((s) => s.id === stickerLayer.stickerId);
    if (!stickerDef) continue;

    // Load sticker SVG into an image
    const stickerSvg = stickerDef.svgContent.trim();
    const svgBlob = new Blob([stickerSvg], { type: 'image/svg+xml;charset=utf-8' });
    const stickerUrl = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve) => {
      const stickerImg = new Image();
      stickerImg.onload = () => {
        ctx.save();
        const posX = (stickerLayer.x / 100) * baseWidth;
        const posY = bannerHeight + (stickerLayer.y / 100) * baseHeight;
        const sWidth = 120 * stickerLayer.scale * (baseWidth / 600);
        const sHeight = (stickerImg.naturalHeight / (stickerImg.naturalWidth || 1)) * sWidth;

        ctx.translate(posX, posY);
        ctx.rotate((stickerLayer.rotation * Math.PI) / 180);
        ctx.drawImage(stickerImg, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
        ctx.restore();
        URL.revokeObjectURL(stickerUrl);
        resolve();
      };
      stickerImg.onerror = () => {
        URL.revokeObjectURL(stickerUrl);
        resolve();
      };
      stickerImg.src = stickerUrl;
    });
  }

  // Render text layers
  for (const layer of textLayers) {
    if (!layer.text.trim()) continue;

    ctx.save();

    // Scale font size proportionally to base width
    const scaleFactor = baseWidth / 600;
    const computedFontSize = Math.round(layer.fontSize * scaleFactor);
    ctx.font = `900 ${computedFontSize}px ${getFontFamilyCss(layer.fontFamily)}`;
    ctx.textAlign = layer.align;
    ctx.textBaseline = 'middle';

    const textToDraw = layer.isUppercase ? layer.text.toUpperCase() : layer.text;

    let posX = (layer.x / 100) * baseWidth;
    let posY = (layer.y / 100) * canvas.height;

    // Handle modern twitter banner text position
    if (headerStyle === 'modern-twitter' && layer.isTopOrBottom === 'top') {
      posX = baseWidth / 2;
      posY = bannerHeight / 2;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = `700 ${Math.round(computedFontSize * 0.85)}px "Inter", sans-serif`;
    }

    ctx.translate(posX, posY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }

    // Word wrap multi-line text
    const maxWidth = baseWidth * 0.92;
    const words = textToDraw.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const lineHeight = computedFontSize * 1.15;
    const startY = -((lines.length - 1) * lineHeight) / 2;

    // Background pill/box if enabled
    if (layer.hasBackground) {
      const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const padX = computedFontSize * 0.4;
      const padY = computedFontSize * 0.3;
      ctx.fillStyle = layer.backgroundColor || 'rgba(0, 0, 0, 0.7)';
      let boxX = -maxLineWidth / 2 - padX;
      if (layer.align === 'left') boxX = -padX;
      if (layer.align === 'right') boxX = -maxLineWidth - padX;

      ctx.fillRect(
        boxX,
        startY - computedFontSize / 2 - padY,
        maxLineWidth + padX * 2,
        lines.length * lineHeight + padY * 2
      );
    }

    // Stroke & Fill
    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;

      if (layer.strokeWidth > 0 && !(headerStyle === 'modern-twitter' && layer.isTopOrBottom === 'top')) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth * scaleFactor;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, 0, lineY);
      }

      ctx.fillStyle = (headerStyle === 'modern-twitter' && layer.isTopOrBottom === 'top')
        ? '#0f172a'
        : layer.fillColor;
      ctx.fillText(line, 0, lineY);
    });

    ctx.restore();
  }

  return canvas;
}
