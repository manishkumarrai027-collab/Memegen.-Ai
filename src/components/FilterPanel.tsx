import React, { useState } from 'react';
import { MemeFilters, MemeTextLayer, MemeStickerLayer, MemeAnimationType } from '../types';
import { ANIMATION_OPTIONS } from '../utils/animationUtils';
import { STICKERS } from '../data/stickers';
import { removeImageBackground } from '../utils/backgroundRemoval';
import {
  Sliders,
  Flame,
  RotateCcw,
  Sparkles,
  Activity,
  Clock,
  Zap,
  Check,
  Scissors,
  Wand2,
  Layers,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface FilterPanelProps {
  filters: MemeFilters;
  onUpdateFilters: (updates: Partial<MemeFilters>) => void;
  onResetFilters: () => void;
  onRecordChange?: () => void;
  textLayers: MemeTextLayer[];
  stickers: MemeStickerLayer[];
  selectedTextId: string | null;
  selectedStickerId: string | null;
  onSelectText: (id: string | null) => void;
  onSelectSticker: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: Partial<MemeTextLayer>) => void;
  onUpdateStickerLayer: (id: string, updates: Partial<MemeStickerLayer>) => void;
  currentImageSrc?: string;
  onApplyCutoutImage?: (newImageSrc: string) => void;
  onAddCutoutAsSticker?: (cutoutDataUrl: string) => void;
  onOpenAltText?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  onRecordChange,
  textLayers,
  stickers,
  selectedTextId,
  selectedStickerId,
  onSelectText,
  onSelectSticker,
  onUpdateTextLayer,
  onUpdateStickerLayer,
  currentImageSrc,
  onApplyCutoutImage,
  onAddCutoutAsSticker,
  onOpenAltText,
}) => {
  // Background Removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgCutoutResult, setBgCutoutResult] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(25);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [appliedCutout, setAppliedCutout] = useState(false);

  const handleExecuteRemoveBackground = async () => {
    if (!currentImageSrc) return;
    setIsRemovingBg(true);
    setRemovalError(null);
    try {
      const cutout = await removeImageBackground(currentImageSrc, { tolerance });
      setBgCutoutResult(cutout);
    } catch (err: any) {
      console.error('Remove background error:', err);
      setRemovalError(err.message || 'Failed to remove background');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleApplyCutoutToCanvas = () => {
    if (!bgCutoutResult || !onApplyCutoutImage) return;
    onRecordChange?.();
    onApplyCutoutImage(bgCutoutResult);
    setAppliedCutout(true);
  };

  const handleAddCutoutToStickers = () => {
    if (!bgCutoutResult || !onAddCutoutAsSticker) return;
    onRecordChange?.();
    onAddCutoutAsSticker(bgCutoutResult);
  };

  // Determine selected target item (text or sticker)
  const defaultTargetId = selectedTextId || selectedStickerId || textLayers[0]?.id || 'top-text';
  const defaultTargetType: 'text' | 'sticker' = selectedStickerId ? 'sticker' : 'text';

  const [targetType, setTargetType] = useState<'text' | 'sticker'>(defaultTargetType);
  const [targetId, setTargetId] = useState<string>(defaultTargetId);

  // Sync if selected external items change
  const activeTextLayer = textLayers.find((l) => l.id === (targetType === 'text' ? targetId : selectedTextId));
  const activeStickerLayer = stickers.find((s) => s.id === (targetType === 'sticker' ? targetId : selectedStickerId));

  const currentAnimation: MemeAnimationType =
    targetType === 'text'
      ? activeTextLayer?.animation || 'none'
      : activeStickerLayer?.animation || 'none';

  const currentDuration: number =
    targetType === 'text'
      ? activeTextLayer?.animationDuration ?? 1.0
      : activeStickerLayer?.animationDuration ?? 1.0;

  const handleSelectAnimation = (anim: MemeAnimationType) => {
    onRecordChange?.();
    if (targetType === 'text' && activeTextLayer) {
      onUpdateTextLayer(activeTextLayer.id, { animation: anim });
    } else if (targetType === 'sticker' && activeStickerLayer) {
      onUpdateStickerLayer(activeStickerLayer.id, { animation: anim });
    }
  };

  const handleDurationChange = (dur: number) => {
    if (targetType === 'text' && activeTextLayer) {
      onUpdateTextLayer(activeTextLayer.id, { animationDuration: dur });
    } else if (targetType === 'sticker' && activeStickerLayer) {
      onUpdateStickerLayer(activeStickerLayer.id, { animationDuration: dur });
    }
  };

  const handleApplyToAll = (anim: MemeAnimationType, dur: number) => {
    onRecordChange?.();
    textLayers.forEach((l) => {
      onUpdateTextLayer(l.id, { animation: anim, animationDuration: dur });
    });
    stickers.forEach((s) => {
      onUpdateStickerLayer(s.id, { animation: anim, animationDuration: dur });
    });
  };

  const handleResetAllAnimations = () => {
    onRecordChange?.();
    textLayers.forEach((l) => {
      onUpdateTextLayer(l.id, { animation: 'none' });
    });
    stickers.forEach((s) => {
      onUpdateStickerLayer(s.id, { animation: 'none' });
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Meme Animation Section */}
      <div className="p-3.5 bg-gradient-to-b from-purple-950/40 to-slate-950 rounded-2xl border border-purple-500/30 space-y-3.5 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-200">
              Meme Animation
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30">
              Live CSS
            </span>
            <button
              type="button"
              onClick={handleResetAllAnimations}
              className="text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
              title="Remove animations from all layers"
            >
              Reset Anim
            </button>
          </div>
        </div>

        {/* Target Layer Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Animate Target Layer:</span>
            <span className="text-amber-400 font-mono text-[9px]">
              {targetType === 'text' ? 'Text' : 'Sticker'} Layer
            </span>
          </label>
          <select
            value={`${targetType}:${targetType === 'text' ? activeTextLayer?.id || targetId : activeStickerLayer?.id || targetId}`}
            onChange={(e) => {
              const [type, id] = e.target.value.split(':') as ['text' | 'sticker', string];
              setTargetType(type);
              setTargetId(id);
              if (type === 'text') {
                onSelectText(id);
                onSelectSticker(null);
              } else {
                onSelectSticker(id);
                onSelectText(null);
              }
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-medium"
          >
            <optgroup label="Text Captions">
              {textLayers.map((layer) => (
                <option key={layer.id} value={`text:${layer.id}`}>
                  {layer.isTopOrBottom === 'top'
                    ? 'Top Caption'
                    : layer.isTopOrBottom === 'bottom'
                    ? 'Bottom Caption'
                    : 'Extra Floating Text'}{' '}
                  {layer.text ? `("${layer.text.slice(0, 16)}${layer.text.length > 16 ? '...' : ''}")` : ''}
                </option>
              ))}
            </optgroup>

            {stickers.length > 0 && (
              <optgroup label="Meme Stickers">
                {stickers.map((stk, idx) => {
                  const def = STICKERS.find((s) => s.id === stk.stickerId);
                  return (
                    <option key={stk.id} value={`sticker:${stk.id}`}>
                      Sticker #{idx + 1}: {def?.name || stk.stickerId}
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>
        </div>

        {/* Animation Preset Buttons */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Animation Effect
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {ANIMATION_OPTIONS.map((opt) => {
              const isSelected = currentAnimation === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectAnimation(opt.id)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer group relative overflow-hidden ${
                    isSelected
                      ? 'bg-purple-600/25 border-purple-400 text-purple-200 ring-1 ring-purple-400/60 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                  title={opt.description}
                >
                  <span className={`text-[11px] font-black tracking-wide ${isSelected ? 'text-amber-300' : ''}`}>
                    {opt.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60 font-mono">
                    {opt.tag}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Slider Setting */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> Animation Speed & Duration
            </span>
            <span className="font-mono text-amber-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              {currentDuration.toFixed(1)}s{' '}
              <span className="text-[9px] text-slate-400">
                ({currentDuration <= 0.6 ? 'Hyper' : currentDuration <= 1.2 ? 'Fast' : 'Smooth'})
              </span>
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={currentDuration}
            onPointerDown={() => onRecordChange?.()}
            onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />

          {/* Quick Speed Preset Buttons */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {[
              { label: '⚡ Hyper (0.4s)', value: 0.4 },
              { label: '🏃 Normal (1.0s)', value: 1.0 },
              { label: '🐢 Slow (2.0s)', value: 2.0 },
            ].map((spd) => (
              <button
                key={spd.value}
                type="button"
                onClick={() => {
                  onRecordChange?.();
                  handleDurationChange(spd.value);
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  Math.abs(currentDuration - spd.value) < 0.15
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Apply To All Layers Quick Action */}
          <button
            type="button"
            onClick={() => handleApplyToAll(currentAnimation, currentDuration)}
            className="w-full mt-1 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 rounded-lg text-[11px] font-bold text-purple-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Apply This Animation to All Layers</span>
          </button>
        </div>
      </div>

      {/* 2. AI Background Removal Tool */}
      <div className="p-3.5 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 rounded-2xl border border-emerald-500/30 space-y-3 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
              Remove Background
            </span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
            <Wand2 className="w-2.5 h-2.5" />
            API Cutout
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Extract the main subject or character from your current meme template with clean transparent edges.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleExecuteRemoveBackground}
          disabled={isRemovingBg || !currentImageSrc}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {isRemovingBg ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Extracting Subject...</span>
            </>
          ) : (
            <>
              <Scissors className="w-3.5 h-3.5" />
              <span>Extract Subject (Remove Background)</span>
            </>
          )}
        </button>

        {removalError && (
          <div className="p-2.5 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-[11px] flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{removalError}</span>
          </div>
        )}

        {/* Cutout Result & Options */}
        {bgCutoutResult && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/40 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Cutout Generated!
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Transparent PNG</span>
            </div>

            {/* Checkerboard preview box */}
            <div className="h-28 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center p-2 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:16px_16px]">
              <img
                src={bgCutoutResult}
                alt="Subject cutout preview"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            </div>

            {/* Tolerance Fine-Tuning */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Edge Sensitivity (Tolerance)</span>
                <span className="font-mono text-emerald-300">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={tolerance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTolerance(val);
                }}
                onPointerUp={handleExecuteRemoveBackground}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Actions for Cutout */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleApplyCutoutToCanvas}
                className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow"
                title="Replace meme background with this transparent cutout"
              >
                <Check className="w-3 h-3" />
                <span>Set as Canvas</span>
              </button>

              <button
                type="button"
                onClick={handleAddCutoutToStickers}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                title="Add cutout as a movable draggable sticker layer"
              >
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Add as Sticker</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Meme Image Filters & Effects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" /> Color Filters & Presets
          </span>
          <button
            onClick={() => {
              onRecordChange?.();
              onResetFilters();
            }}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Colors
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onRecordChange?.();
              onUpdateFilters({ deepFried: !filters.deepFried });
            }}
            className={`p-3 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              filters.deepFried
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white border-amber-400 shadow-lg shadow-red-500/25 ring-2 ring-amber-400'
                : 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 animate-bounce" />
            <span>🔥 Deep-Fried Filter</span>
          </button>

          <button
            onClick={() => {
              onRecordChange?.();
              onUpdateFilters({ invert: !filters.invert });
            }}
            className={`p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              filters.invert
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-slate-950 border-slate-800 text-purple-400 hover:bg-slate-900'
            }`}
          >
            Invert Colors
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Brightness</span>
              <span className="font-mono text-slate-300">{filters.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={filters.brightness}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateFilters({ brightness: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Contrast</span>
              <span className="font-mono text-slate-300">{filters.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={filters.contrast}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateFilters({ contrast: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Saturation</span>
              <span className="font-mono text-slate-300">{filters.saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              value={filters.saturation}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateFilters({ saturation: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Sepia / Vintage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Vintage Sepia</span>
              <span className="font-mono text-slate-300">{filters.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.sepia}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateFilters({ sepia: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Grayscale / Noir</span>
              <span className="font-mono text-slate-300">{filters.grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.grayscale}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateFilters({ grayscale: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Accessibility Alt-Text & Social Descriptions */}
      {onOpenAltText && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 rounded-2xl border border-amber-400/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  AI Alt-Text & Social Copy
                </h4>
                <span className="text-[9px] font-bold px-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  EN / HI / Hinglish
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate accessible screen-reader descriptions and social media copy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAltText}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow cursor-pointer whitespace-nowrap"
          >
            Generate
          </button>
        </div>
      )}
    </div>
  );
};
