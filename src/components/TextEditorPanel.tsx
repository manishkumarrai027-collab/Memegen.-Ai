import React, { useState } from 'react';
import { MemeTextLayer, HeaderStyle } from '../types';
import { FONT_PRESETS, getFontFamilyCss } from '../utils/fontUtils';
import { Type, ArrowUpDown, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Palette, Sparkles, Check } from 'lucide-react';

interface TextEditorPanelProps {
  textLayers: MemeTextLayer[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: Partial<MemeTextLayer>) => void;
  onAddFreeformText: () => void;
  onDeleteTextLayer: (id: string) => void;
  onSwapTopBottom: () => void;
  headerStyle: HeaderStyle;
  onToggleHeaderStyle: () => void;
  onRecordChange?: () => void;
}

export const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  textLayers,
  selectedTextId,
  onSelectText,
  onUpdateTextLayer,
  onAddFreeformText,
  onDeleteTextLayer,
  onSwapTopBottom,
  headerStyle,
  onToggleHeaderStyle,
  onRecordChange,
}) => {
  const [applyToAll, setApplyToAll] = useState(false);
  const topLayer = textLayers.find((l) => l.isTopOrBottom === 'top');
  const bottomLayer = textLayers.find((l) => l.isTopOrBottom === 'bottom');
  const activeLayer = textLayers.find((l) => l.id === selectedTextId) || topLayer || textLayers[0];

  const handleSelectFontPreset = (fontId: string) => {
    onRecordChange?.();
    if (applyToAll) {
      textLayers.forEach((l) => {
        onUpdateTextLayer(l.id, { fontFamily: fontId });
      });
    } else if (activeLayer) {
      onUpdateTextLayer(activeLayer.id, { fontFamily: fontId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top & Bottom Quick Inputs */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Meme Captions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleHeaderStyle}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border transition ${
                headerStyle === 'modern-twitter'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle Twitter/Reddit modern header format"
            >
              {headerStyle === 'modern-twitter' ? 'Twitter Header' : 'Classic Top/Bottom'}
            </button>

            <button
              onClick={onSwapTopBottom}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-md transition"
              title="Swap Top and Bottom text"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Text input */}
        {topLayer && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-amber-400">Top Text / Setup:</span>
              <button
                onClick={() => onSelectText(topLayer.id)}
                className={`text-[10px] hover:underline ${selectedTextId === topLayer.id ? 'text-amber-400 font-bold' : ''}`}
              >
                Edit Style
              </button>
            </div>
            <textarea
              rows={2}
              value={topLayer.text}
              onFocus={() => onRecordChange?.()}
              onChange={(e) => onUpdateTextLayer(topLayer.id, { text: e.target.value })}
              placeholder="TOP TEXT..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 uppercase tracking-wide focus:outline-none focus:border-amber-400 resize-none font-bold"
            />
          </div>
        )}

        {/* Bottom Text input */}
        {bottomLayer && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-amber-400">Bottom Text / Punchline:</span>
              <button
                onClick={() => onSelectText(bottomLayer.id)}
                className={`text-[10px] hover:underline ${selectedTextId === bottomLayer.id ? 'text-amber-400 font-bold' : ''}`}
              >
                Edit Style
              </button>
            </div>
            <textarea
              rows={2}
              value={bottomLayer.text}
              onFocus={() => onRecordChange?.()}
              onChange={(e) => onUpdateTextLayer(bottomLayer.id, { text: e.target.value })}
              placeholder="BOTTOM TEXT..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 uppercase tracking-wide focus:outline-none focus:border-amber-400 resize-none font-bold"
            />
          </div>
        )}

        {/* Freeform Text Layers */}
        {textLayers.filter((l) => l.isTopOrBottom === 'free').map((freeLayer, idx) => (
          <div key={freeLayer.id} className="space-y-1 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-purple-400 font-semibold">Extra Text #{idx + 1}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectText(freeLayer.id)}
                  className={`text-[10px] ${selectedTextId === freeLayer.id ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
                >
                  Style
                </button>
                <button
                  onClick={() => onDeleteTextLayer(freeLayer.id)}
                  className="text-red-400 hover:text-red-300 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={freeLayer.text}
              onFocus={() => onRecordChange?.()}
              onChange={(e) => onUpdateTextLayer(freeLayer.id, { text: e.target.value })}
              placeholder="Custom caption text..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
            />
          </div>
        ))}

        <button
          onClick={onAddFreeformText}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add Floating Text Layer</span>
        </button>
      </div>

      {/* Style & Font Controls for Selected Layer */}
      {activeLayer && (
        <div className="space-y-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" /> Typography & Styling
            </span>
            <span className="text-[10px] text-amber-400 font-mono">
              Editing: {activeLayer.isTopOrBottom === 'top' ? 'Top' : activeLayer.isTopOrBottom === 'bottom' ? 'Bottom' : 'Extra'}
            </span>
          </div>

          {/* Font Presets Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Meme Font Presets
              </label>

              <button
                type="button"
                onClick={() => setApplyToAll(!applyToAll)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                  applyToAll
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title="When enabled, changing font changes all captions at once"
              >
                {applyToAll && <Check className="w-2.5 h-2.5" />}
                Apply to All Layers
              </button>
            </div>

            {/* Quick 2x4 Font Preset Cards */}
            <div className="grid grid-cols-2 gap-2">
              {FONT_PRESETS.map((preset) => {
                const isSelected =
                  activeLayer.fontFamily.toLowerCase() === preset.id.toLowerCase() ||
                  activeLayer.fontFamily.toLowerCase() === preset.name.toLowerCase();

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectFontPreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative group flex flex-col justify-between overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-900 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-semibold text-slate-200">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                          {preset.tag.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Font Preview Text Rendered in its authentic font family */}
                    <div
                      style={{
                        fontFamily: preset.cssFamily,
                      }}
                      className={`text-sm sm:text-base font-black truncate tracking-wide ${
                        isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {preset.previewText}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Traditional Dropdown Select */}
            <div className="pt-1">
              <select
                value={activeLayer.fontFamily}
                onChange={(e) => handleSelectFontPreset(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {FONT_PRESETS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name} — {font.tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Font Size</span>
              <span className="font-mono text-slate-300">{activeLayer.fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="72"
              value={activeLayer.fontSize}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateTextLayer(activeLayer.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Colors & Stroke */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Text Fill
              </label>
              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={activeLayer.fillColor}
                  onFocus={() => onRecordChange?.()}
                  onChange={(e) => onUpdateTextLayer(activeLayer.id, { fillColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">
                  {activeLayer.fillColor}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Outline Color
              </label>
              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={activeLayer.strokeColor}
                  onFocus={() => onRecordChange?.()}
                  onChange={(e) => onUpdateTextLayer(activeLayer.id, { strokeColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">
                  {activeLayer.strokeColor}
                </span>
              </div>
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Outline Thickness</span>
              <span className="font-mono text-slate-300">{activeLayer.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={activeLayer.strokeWidth}
              onPointerDown={() => onRecordChange?.()}
              onChange={(e) => onUpdateTextLayer(activeLayer.id, { strokeWidth: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Alignment & Uppercase & Background Box */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => {
                    onRecordChange?.();
                    onUpdateTextLayer(activeLayer.id, { align });
                  }}
                  className={`p-1.5 rounded ${activeLayer.align === align ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onRecordChange?.();
                onUpdateTextLayer(activeLayer.id, { isUppercase: !activeLayer.isUppercase });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                activeLayer.isUppercase
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              ALL CAPS
            </button>

            <button
              onClick={() => {
                onRecordChange?.();
                onUpdateTextLayer(activeLayer.id, { hasBackground: !activeLayer.hasBackground });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                activeLayer.hasBackground
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Pill Box
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
