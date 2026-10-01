import React, { useState } from 'react';
import { Eye, X, RefreshCw, Sparkles, Flame, CheckCircle, Lightbulb, LayoutTemplate } from 'lucide-react';
import { ImageAnalysisResult } from '../types';
import { getRasterizedBase64 } from '../utils/imageUtils';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onTriggerMagicCaptions: () => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onTriggerMagicCaptions,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeImage = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const rasterizedImage = await getRasterizedBase64(imageSrc);
      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: rasterizedImage }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data: ImageAnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze image context.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">AI Image Understanding</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-full">
                  gemini-3.1-pro-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deep scene inspection, viral potential rating & comedic breakdown
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={handleAnalyzeImage}
                className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-white font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Initial State */}
          {!analysis && !loading && (
            <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Eye className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Perform Deep Vision Analysis</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Gemini 3.1 Pro will examine the visual details, expressions, posture, background objects, and calculate viral meme potential.
                </p>
              </div>
              <button
                onClick={handleAnalyzeImage}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-blue-500/25 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze This Image Now
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-14 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
                <Eye className="w-6 h-6 text-blue-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Analyzing Image with Gemini 3.1 Pro...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Detecting subject expressions, emotional resonance, and comedic angles...
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {analysis && !loading && (
            <div className="space-y-5">
              {/* Top Banner: Score & Vibe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-lg">
                    {analysis.memePotentialScore.toFixed(1)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Meme Potential
                    </div>
                    <div className="text-sm font-black text-white">
                      {analysis.memePotentialScore >= 8 ? '🔥 Viral Grade' : 'Solid Base'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emotional Vibe</div>
                    <div className="text-xs font-bold text-purple-200 line-clamp-1">{analysis.emotionalVibe}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <LayoutTemplate className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best Format</div>
                    <div className="text-xs font-bold text-blue-200 line-clamp-1">{analysis.recommendedFormat}</div>
                  </div>
                </div>
              </div>

              {/* Scene Summary */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Scene Understanding
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{analysis.sceneSummary}</p>
              </div>

              {/* Key Subjects & Expressions */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Key Subjects & Expressions Spotted
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keySubjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comedic Angles */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Recommended Comedic Angles
                </div>
                <div className="space-y-2">
                  {analysis.comedicAngles.map((angle, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{angle}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onTriggerMagicCaptions();
                  }}
                  className="w-full sm:w-auto flex-1 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate 5 Captions From This Analysis
                </button>
                <button
                  onClick={handleAnalyzeImage}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
