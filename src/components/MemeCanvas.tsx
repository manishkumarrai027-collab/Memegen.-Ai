import React, { useRef, useState, useEffect } from 'react';
import { MemeTextLayer, MemeStickerLayer, MemeFilters, HeaderStyle } from '../types';
import { STICKERS } from '../data/stickers';
import { getFontFamilyCss } from '../utils/fontUtils';
import { getAnimationCss } from '../utils/animationUtils';
import { Move, Trash2, RotateCw } from 'lucide-react';

interface MemeCanvasProps {
  imageSrc: string;
  textLayers: MemeTextLayer[];
  stickers: MemeStickerLayer[];
  filters: MemeFilters;
  headerStyle: HeaderStyle;
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: Partial<MemeTextLayer>) => void;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickerLayer: (id: string, updates: Partial<MemeStickerLayer>) => void;
  onDeleteSticker: (id: string) => void;
  onDragStart?: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  imageSrc,
  textLayers,
  stickers,
  filters,
  headerStyle,
  selectedTextId,
  onSelectText,
  onUpdateTextLayer,
  selectedStickerId,
  onSelectSticker,
  onUpdateStickerLayer,
  onDeleteSticker,
  onDragStart,
  canvasRef,
  imgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<{
    type: 'text' | 'sticker';
    id: string;
    startX: number;
    startY: number;
    initialLayerX: number;
    initialLayerY: number;
  } | null>(null);

  // Compute CSS filter string
  const getFilterStyle = () => {
    if (filters.deepFried) {
      return 'contrast(220%) saturate(280%) brightness(110%) sepia(30%)';
    }
    let filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`;
    if (filters.invert) {
      filter += ' invert(100%)';
    }
    return filter;
  };

  // Mouse / Touch drag handling
  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'text' | 'sticker',
    id: string,
    currentX: number,
    currentY: number
  ) => {
    e.stopPropagation();
    if (type === 'text') {
      onSelectText(id);
      onSelectSticker(null);
    } else {
      onSelectSticker(id);
      onSelectText(null);
    }

    onDragStart?.();

    setDraggingItem({
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialLayerX: currentX,
      initialLayerY: currentY,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingItem || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaXPercent = ((e.clientX - draggingItem.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - draggingItem.startY) / rect.height) * 100;

      const newX = Math.max(5, Math.min(95, Math.round(draggingItem.initialLayerX + deltaXPercent)));
      const newY = Math.max(5, Math.min(95, Math.round(draggingItem.initialLayerY + deltaYPercent)));

      if (draggingItem.type === 'text') {
        onUpdateTextLayer(draggingItem.id, { x: newX, y: newY });
      } else {
        onUpdateStickerLayer(draggingItem.id, { x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      setDraggingItem(null);
    };

    if (draggingItem) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingItem, onUpdateTextLayer, onUpdateStickerLayer]);

  const topLayer = textLayers.find((l) => l.isTopOrBottom === 'top');

  return (
    <div className="relative flex items-center justify-center w-full h-full p-2 sm:p-4 select-none">
      <div
        ref={canvasRef}
        className="relative max-w-full max-h-[75vh] rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900 flex flex-col transition-all"
        onClick={() => {
          onSelectText(null);
          onSelectSticker(null);
        }}
      >
        {/* Modern Twitter / Reddit Style Banner (if enabled) */}
        {headerStyle === 'modern-twitter' && topLayer && (
          <div className="bg-white text-slate-900 px-6 py-4 border-b border-slate-200 z-10 flex items-center justify-center min-h-[64px]">
            <p className="font-sans font-bold text-lg sm:text-xl text-center leading-snug tracking-tight text-slate-900 break-words max-w-xl">
              {topLayer.text || 'Add your punchy caption here...'}
            </p>
          </div>
        )}

        {/* Main Image Container */}
        <div ref={containerRef} className="relative overflow-hidden flex items-center justify-center">
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Meme Canvas Base"
            crossOrigin="anonymous"
            style={{ filter: getFilterStyle() }}
            className="max-h-[65vh] w-auto max-w-full object-contain pointer-events-none block transition-all"
          />

          {/* Stickers Overlay */}
          {stickers.map((sticker) => {
            const def = STICKERS.find((s) => s.id === sticker.stickerId);
            if (!def) return null;
            const isSelected = selectedStickerId === sticker.id;

            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handlePointerDown(e, 'sticker', sticker.id, sticker.x, sticker.y)}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                }}
                className={`absolute cursor-move touch-none z-20 group p-1 transition-shadow ${
                  isSelected ? 'ring-2 ring-amber-400 rounded-lg shadow-lg' : 'hover:ring-1 hover:ring-white/40'
                }`}
              >
                <div
                  style={{
                    animation: getAnimationCss(sticker.animation, sticker.animationDuration),
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center pointer-events-none select-none"
                >
                  {sticker.customImageUrl ? (
                    <img
                      src={sticker.customImageUrl}
                      alt="Custom cutout sticker"
                      className="w-full h-full object-contain drop-shadow-md"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: def?.svgContent || '' }}
                    />
                  )}
                </div>

                {/* Sticker floating controls when selected */}
                {isSelected && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/90 text-white px-2 py-1 rounded-md text-xs shadow-md border border-slate-700 pointer-events-auto">
                    <button
                      title="Rotate 45°"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStickerLayer(sticker.id, {
                          rotation: (sticker.rotation + 45) % 360,
                        });
                      }}
                      className="p-1 hover:text-amber-400 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Enlarge"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStickerLayer(sticker.id, {
                          scale: Math.min(3, sticker.scale + 0.25),
                        });
                      }}
                      className="px-1.5 font-bold hover:text-amber-400 transition"
                    >
                      +
                    </button>
                    <button
                      title="Shrink"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStickerLayer(sticker.id, {
                          scale: Math.max(0.5, sticker.scale - 0.25),
                        });
                      }}
                      className="px-1.5 font-bold hover:text-amber-400 transition"
                    >
                      -
                    </button>
                    <button
                      title="Delete sticker"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSticker(sticker.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Text Layers */}
          {textLayers.map((layer) => {
            // Hide top text from image area if modern-twitter style is enabled
            if (headerStyle === 'modern-twitter' && layer.isTopOrBottom === 'top') {
              return null;
            }

            const isSelected = selectedTextId === layer.id;
            const textToDisplay = layer.isUppercase ? layer.text.toUpperCase() : layer.text;

            return (
              <div
                key={layer.id}
                onPointerDown={(e) => handlePointerDown(e, 'text', layer.id, layer.x, layer.y)}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                  width: '92%',
                }}
                className={`absolute cursor-move touch-none z-30 transition-shadow ${
                  isSelected ? 'ring-2 ring-amber-400/80 rounded-md p-1 bg-amber-400/5' : ''
                }`}
              >
                <div
                  style={{
                    fontFamily: getFontFamilyCss(layer.fontFamily),
                    fontSize: `clamp(18px, ${layer.fontSize * 0.75}px, 60px)`,
                    color: layer.fillColor,
                    WebkitTextStroke:
                      layer.strokeWidth > 0 ? `${Math.max(1, layer.strokeWidth * 0.6)}px ${layer.strokeColor}` : 'none',
                    textShadow:
                      layer.strokeWidth > 0
                        ? `2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)`
                        : '0 2px 8px rgba(0,0,0,0.9)',
                    textAlign: layer.align,
                    backgroundColor: layer.hasBackground ? layer.backgroundColor : 'transparent',
                    lineHeight: 1.15,
                    animation: getAnimationCss(layer.animation, layer.animationDuration),
                  }}
                  className="font-black tracking-wide break-words select-none px-2 py-0.5"
                >
                  {textToDisplay || (
                    <span className="opacity-40 italic text-sm font-sans font-normal">
                      Double click or use controls to edit text...
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow pointer-events-none">
                    <Move className="w-3 h-3" /> Drag to position
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
