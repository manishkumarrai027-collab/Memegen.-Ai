import React, { useState } from 'react';
import { MemeSound } from '../types';
import { MEME_SOUNDS, playMemeSound, stopCurrentSound } from '../utils/soundEffects';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  Plus,
  Sparkles,
  Upload,
  Music,
  Trash2,
  Radio,
  Sliders,
} from 'lucide-react';

interface SoundSelectorPanelProps {
  attachedSound: MemeSound | null;
  onAttachSound: (sound: MemeSound | null) => void;
  onRecordChange?: () => void;
  autoPlayOnClick: boolean;
  onToggleAutoPlay: (enabled: boolean) => void;
}

type SoundCategory = 'all' | 'dank' | 'classic' | 'dramatic' | 'cartoon';

export const SoundSelectorPanel: React.FC<SoundSelectorPanelProps> = ({
  attachedSound,
  onAttachSound,
  onRecordChange,
  autoPlayOnClick,
  onToggleAutoPlay,
}) => {
  const [activeCategory, setActiveCategory] = useState<SoundCategory>('all');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [customSounds, setCustomSounds] = useState<MemeSound[]>([]);

  const handlePlayPreview = (sound: MemeSound) => {
    if (playingSoundId === sound.id) {
      stopCurrentSound();
      setPlayingSoundId(null);
    } else {
      stopCurrentSound();
      setPlayingSoundId(sound.id);
      playMemeSound(sound, volume);

      // Auto clear playing state after duration
      setTimeout(() => {
        setPlayingSoundId((curr) => (curr === sound.id ? null : curr));
      }, sound.duration * 1000 + 100);
    }
  };

  const handleToggleAttach = (sound: MemeSound) => {
    onRecordChange?.();
    if (attachedSound?.id === sound.id) {
      onAttachSound(null);
    } else {
      onAttachSound(sound);
      // Play a quick confirmation preview
      handlePlayPreview(sound);
    }
  };

  const handleUploadCustomAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const customSound: MemeSound = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'custom',
        description: 'Uploaded user custom meme audio',
        emoji: '🎵',
        duration: 3.0,
        soundType: 'custom',
        customAudioUrl: dataUrl,
      };

      setCustomSounds((prev) => [customSound, ...prev]);
      onRecordChange?.();
      onAttachSound(customSound);
    };
    reader.readAsDataURL(file);
  };

  const allAvailableSounds = [...customSounds, ...MEME_SOUNDS];

  const filteredSounds = allAvailableSounds.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-md">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Meme Sound Effects
              </h3>
              <p className="text-[11px] text-slate-400">
                Attach classic viral soundbites to your meme
              </p>
            </div>
          </div>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition cursor-pointer">
            <Upload className="w-3 h-3 text-amber-400" />
            <span>Upload SFX</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleUploadCustomAudio}
              className="hidden"
            />
          </label>
        </div>

        {/* Active Attached Sound Banner */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            attachedSound
              ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-slate-950 border-amber-400/50 shadow-md'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
          }`}
        >
          {attachedSound ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{attachedSound.emoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">
                        {attachedSound.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                        Attached
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {attachedSound.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePlayPreview(attachedSound)}
                    className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold transition cursor-pointer shadow"
                    title="Play attached sound"
                  >
                    {playingSoundId === attachedSound.id ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRecordChange?.();
                      onAttachSound(null);
                      stopCurrentSound();
                      setPlayingSoundId(null);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 rounded-lg transition cursor-pointer"
                    title="Remove attached sound"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Auto play on click toggle */}
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoPlayOnClick}
                    onChange={(e) => onToggleAutoPlay(e.target.checked)}
                    className="rounded accent-amber-400 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Trigger sound when clicking meme canvas</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-slate-500" />
                No sound effect attached to this meme yet
              </span>
              <span className="text-[10px] font-bold text-amber-400/80">Choose below 👇</span>
            </div>
          )}
        </div>

        {/* Volume Master Slider */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {volume === 0 ? (
              <VolumeX className="w-3 h-3 text-red-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-amber-400" />
            )}
            <span>SFX Volume: {Math.round(volume * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-28 accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
          {[
            { id: 'all', label: 'All Sounds' },
            { id: 'dank', label: '🔥 MLG & Dank' },
            { id: 'classic', label: '🗿 Classic' },
            { id: 'dramatic', label: '🎻 Dramatic' },
            { id: 'cartoon', label: '🎺 Cartoon' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as SoundCategory)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sound Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSounds.map((sound) => {
          const isAttached = attachedSound?.id === sound.id;
          const isPlaying = playingSoundId === sound.id;

          return (
            <div
              key={sound.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isAttached
                  ? 'bg-amber-500/10 border-amber-400/60 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => handlePlayPreview(sound)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 cursor-pointer transition select-none ${
                    isPlaying
                      ? 'bg-amber-400 ring-2 ring-amber-300 scale-105 shadow-md shadow-amber-500/30'
                      : 'bg-slate-900 border border-slate-800 hover:border-amber-400/60 hover:scale-105'
                  }`}
                  title="Click to play preview"
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 text-slate-950 fill-current" />
                  ) : (
                    <span>{sound.emoji}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-100 truncate">
                      {sound.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500">
                      {sound.duration}s
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {sound.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Play Preview Button */}
                <button
                  type="button"
                  onClick={() => handlePlayPreview(sound)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                  }`}
                  title={isPlaying ? 'Stop' : 'Listen'}
                >
                  {isPlaying ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>

                {/* Attach to Meme Button */}
                <button
                  type="button"
                  onClick={() => handleToggleAttach(sound)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                    isAttached
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow'
                      : 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-700'
                  }`}
                  title={isAttached ? 'Click to detach' : 'Attach to current meme'}
                >
                  {isAttached ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Attached</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Attach</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
