import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, X, Check, Flame, MessageSquareQuote, Zap } from 'lucide-react';
import { MagicCaptionItem } from '../types';
import { getRasterizedBase64 } from '../utils/imageUtils';

interface MagicCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCaption: (caption: MagicCaptionItem) => void;
}

const TONES = [
  { id: 'balanced', label: '🔥 All-Rounder (Viral)', desc: 'Balanced mix of sarcasm, punchy setups, and relatable irony' },
  { id: 'work-tech', label: '💻 Corporate & Tech Pain', desc: 'Jira tickets, prod outages, endless meetings, deadline panic' },
  { id: 'relatable', label: '🫠 Relatable Daily Struggles', desc: 'Sleep deprivation, grocery regret, procrastination, overthinking' },
  { id: 'savage', label: '💀 Sarcastic & Savage', desc: 'Brutally honest, dry wit, unfiltered reality check' },
  { id: 'unhinged', label: '🤪 Absurd & Unhinged', desc: 'Surreal internet humor, chaotic energy, 3 AM brain thoughts' },
  { id: 'wholesome', label: '✨ Wholesome / Light', desc: 'Playful, cute, uplifting comedy without snark' },
];

export const MagicCaptionModal: React.FC<MagicCaptionModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCaption,
}) => {
  const [selectedTone, setSelectedTone] = useState('balanced');
  const [customContext, setCustomContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<MagicCaptionItem[]>([]);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateCaptions = async () => {
    setLoading(true);
    setErrorMessage(null);
    setAppliedId(null);

    try {
      const activeToneObj = TONES.find((t) => t.id === selectedTone);
      const tonePrompt = activeToneObj ? `${activeToneObj.label} - ${activeToneObj.desc}` : 'Hilarious internet meme humor';

      // Ensure image is rasterized to clean JPEG base64 (required by Gemini vision)
      const rasterizedImage = await getRasterizedBase64(imageSrc);

      const res = await fetch('/api/gemini/magic-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: rasterizedImage,
          tone: tonePrompt,
          contextHint: customContext.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.captions) && data.captions.length > 0) {
        setCaptions(data.captions);
      } else {
        throw new Error('AI returned an unexpected format. Please try again.');
      }
    } catch (err: any) {
      console.error('Magic caption error:', err);
      setErrorMessage(err.message || 'Failed to generate captions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (caption: MagicCaptionItem) => {
    onApplyCaption(caption);
    setAppliedId(caption.id);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/30 via-slate-900 to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">Magic AI Caption Studio</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full">
                  Gemini Vision 3.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI scans the visual context, characters, and irony to craft 5 hilarious captions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar: Tone Selector & Context */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Choose Humor Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedTone === tone.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div>{tone.label}</div>
                </button>
              ))}
            </div>

            {/* Optional hint input */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Optional clue/topic (e.g., 'deploying on Friday', 'my girlfriend', 'crypto crash')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleGenerateCaptions}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Image Context...
                  </>
                ) : captions.length > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate 5 New Captions
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Magic Captions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={handleGenerateCaptions}
                className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-white font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State Animation */}
          {loading && (
            <div className="py-14 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                <Wand2 className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">AI Vision Scanning in Progress...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Gemini Vision is inspecting facial expressions, background details, and comic timing in your image.
                </p>
              </div>
            </div>
          )}

          {/* Initial Call to Action if not loaded yet */}
          {!loading && captions.length === 0 && !errorMessage && (
            <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <MessageSquareQuote className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Ready to unleash the comedy?</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Click the button above to let Gemini analyze your image and craft 5 high-impact viral captions ready to overlay instantly!
                </p>
              </div>
              <button
                onClick={handleGenerateCaptions}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Image & Suggest 5 Captions
              </button>
            </div>
          )}

          {/* Captions Grid */}
          {!loading && captions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">
                  5 AI-Generated Captions — Click any card to apply instantly:
                </span>
                <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3" /> 1-Click Overlay
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {captions.map((cap, index) => {
                  const isApplied = appliedId === cap.id;
                  return (
                    <div
                      key={cap.id || index}
                      onClick={() => handleApply(cap)}
                      className={`relative group p-4 rounded-xl border transition-all cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-xl'
                          : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/60 hover:bg-slate-900/90 shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          {/* Category Badge & Index */}
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              {cap.category || 'Meme Genius'}
                            </span>
                            {cap.humorNote && (
                              <span className="text-[11px] text-slate-400 italic line-clamp-1">
                                {cap.humorNote}
                              </span>
                            )}
                          </div>

                          {/* Caption Text Render Preview */}
                          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1.5 font-sans">
                            {cap.topText && (
                              <div className="text-white font-black tracking-wide text-sm sm:text-base uppercase text-center font-['Impact'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {cap.topText}
                              </div>
                            )}
                            {cap.bottomText && (
                              <div className="text-amber-300 font-black tracking-wide text-sm sm:text-base uppercase text-center font-['Impact'] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {cap.bottomText}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Apply Action Button */}
                        <div className="self-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(cap);
                            }}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                              isApplied
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 group-hover:scale-105 shadow-md shadow-amber-400/20'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Applied!
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3.5 h-3.5" /> Apply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Pro tip: After applying, you can drag the text freely on the canvas!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
