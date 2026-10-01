import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Wand2, Image as ImageIcon, Sliders } from 'lucide-react';
import { getRasterizedBase64 } from '../utils/imageUtils';

interface AiImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageSrc: string;
  onSelectImage: (newImageSrc: string) => void;
}

const MEME_STARTERS = [
  'A cute golden retriever in a business suit holding a presentation about treats',
  'An orange cat staring in disbelief at a computer screen error message',
  'A medieval knight trying to fix a modern Wi-Fi router in full plate armor',
  'A hamster wearing tiny sunglasses and headphones producing electronic music',
  'Two astronauts arguing over who forgot the snacks on the moon',
  'A sleepy panda drinking an absurdly oversized iced latte with sunglasses',
];

const REMIX_IDEAS = [
  'Add glowing red laser eyes and an explosion in the background',
  'Put a golden king crown and sunglasses on the main character',
  'Add intense dramatic thunderstorm with lightning bolts',
  'Make the background on fire like the classic meme',
  'Transform into a retro 1990s vaporwave aesthetic',
];

export const AiImageGeneratorModal: React.FC<AiImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentImageSrc,
  onSelectImage,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'remix'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setPreviewUrl(null);

    try {
      const endpoint = activeTab === 'generate' ? '/api/gemini/generate-image' : '/api/gemini/remix-image';
      const rasterizedImage = activeTab === 'remix' ? await getRasterizedBase64(currentImageSrc) : '';
      const body =
        activeTab === 'generate'
          ? { prompt: prompt.trim(), aspectRatio }
          : { imageBase64: rasterizedImage, prompt: prompt.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        setPreviewUrl(data.imageUrl);
      } else {
        throw new Error('Image generation did not return an image URL');
      }
    } catch (err: any) {
      console.error('Image generation/remix failed:', err);
      setErrorMessage(err.message || 'Generation failed. Please try a different prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCanvas = () => {
    if (previewUrl) {
      onSelectImage(previewUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">AI Image Creator & Remix</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded-full">
                  gemini-3.1-flash-image
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate original meme backgrounds or remix existing photos with text prompts
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('generate');
              setPreviewUrl(null);
            }}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'generate'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Meme Image
          </button>
          <button
            onClick={() => {
              setActiveTab('remix');
              setPreviewUrl(null);
            }}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'remix'
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Remix Current Image
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              {activeTab === 'generate' ? 'Describe the Meme Image You Want' : 'Editing Prompt (What to modify or add)'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === 'generate'
                  ? 'e.g. A cat sitting at an office desk wearing glasses looking stressed in front of a laptop...'
                  : 'e.g. Add glowing red laser eyes to the character and dramatic fire in the background...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          {/* Quick Idea Starters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              💡 Quick Idea Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(activeTab === 'generate' ? MEME_STARTERS : REMIX_IDEAS).map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(idea)}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 text-left border border-slate-700/60 hover:border-purple-400/50 transition truncate max-w-full"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio (Only in generate mode) */}
          {activeTab === 'generate' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square' },
                  { id: '4:3', label: '4:3 Classic' },
                  { id: '16:9', label: '16:9 Wide' },
                  { id: '9:16', label: '9:16 Reel' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-2 rounded-lg border text-xs font-bold transition text-center ${
                      aspectRatio === ar.id
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {activeTab === 'generate' ? 'Generating with Gemini 3.1 Flash Image...' : 'Remixing Image with Gemini...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {activeTab === 'generate' ? 'Generate Meme Base Image' : 'Remix Image Now'}
              </>
            )}
          </button>

          {/* Result Preview */}
          {previewUrl && (
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-xl border border-purple-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Generated Preview:
              </span>
              <div className="flex items-center justify-center max-h-64 overflow-hidden rounded-lg bg-black">
                <img src={previewUrl} alt="AI Generated Meme Base" className="max-h-64 object-contain" />
              </div>
              <button
                onClick={handleApplyToCanvas}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" /> Use As Meme Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
