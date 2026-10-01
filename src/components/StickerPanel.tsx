import React from 'react';
import { STICKERS, MemeSticker } from '../data/stickers';
import { MemeStickerLayer } from '../types';
import { Sticker, Trash2, RotateCw } from 'lucide-react';

interface StickerPanelProps {
  onAddSticker: (sticker: MemeSticker) => void;
  stickers: MemeStickerLayer[];
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateStickerLayer: (id: string, updates: Partial<MemeStickerLayer>) => void;
  onDeleteSticker: (id: string) => void;
  onRecordChange?: () => void;
}

export const StickerPanel: React.FC<StickerPanelProps> = ({
  onAddSticker,
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateStickerLayer,
  onDeleteSticker,
  onRecordChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sticker className="w-3.5 h-3.5 text-amber-400" /> Click to Add Meme Sticker
        </span>
        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => {
                onRecordChange?.();
                onAddSticker(sticker);
              }}
              title={`Add ${sticker.name}`}
              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl transition flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
            >
              <div
                className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition"
                dangerouslySetInnerHTML={{ __html: sticker.svgContent }}
              />
              <span className="text-[10px] text-slate-400 truncate max-w-full group-hover:text-slate-200">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active stickers list */}
      {stickers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Stickers on Canvas ({stickers.length})
          </span>
          <div className="space-y-2">
            {stickers.map((stk, idx) => {
              const def = STICKERS.find((s) => s.id === stk.stickerId);
              const isSelected = selectedStickerId === stk.id;
              return (
                <div
                  key={stk.id}
                  onClick={() => onSelectSticker(stk.id)}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                    <span className="font-semibold">{def?.name || 'Sticker'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordChange?.();
                        onUpdateStickerLayer(stk.id, {
                          rotation: (stk.rotation + 45) % 360,
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Rotate"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordChange?.();
                        onDeleteSticker(stk.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
