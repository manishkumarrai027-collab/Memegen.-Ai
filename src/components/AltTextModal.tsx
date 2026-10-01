import React, { useState, useEffect } from 'react';
import { AltTextResult } from '../types';
import {
  X,
  Copy,
  Check,
  Eye,
  Sparkles,
  RefreshCw,
  Globe,
  Share2,
  FileText,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface AltTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  getMemeImageBase64: () => Promise<string | null>;
  memeTitle?: string;
  captionsContext?: string;
}

type LanguageTab = 'english' | 'hindi' | 'hinglish';
type FormatType = 'concise' | 'detailed' | 'social';

export const AltTextModal: React.FC<AltTextModalProps> = ({
  isOpen,
  onClose,
  getMemeImageBase64,
  memeTitle,
  captionsContext,
}) => {
  const [altData, setAltData] = useState<AltTextResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageTab>('english');
  const [activeFormat, setActiveFormat] = useState<FormatType>('concise');
  const [copied, setCopied] = useState<boolean>(false);
  const [editableText, setEditableText] = useState<string>('');

  const fetchAltText = async () => {
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const imageBase64 = await getMemeImageBase64();
      if (!imageBase64) {
        throw new Error('Could not capture current meme canvas');
      }

      const res = await fetch('/api/gemini/generate-alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          memeTitle,
          captionsContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate alt-text (status ${res.status})`);
      }

      const data: AltTextResult = await res.json();
      setAltData(data);
    } catch (err: any) {
      console.error('Error generating alt-text:', err);
      setError(err.message || 'Failed to analyze meme image');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAltText();
    } else {
      setAltData(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Synchronize text when active language, format, or altData changes
  useEffect(() => {
    if (!altData) return;

    const langData = altData[activeLang];
    if (!langData) return;

    if (activeFormat === 'concise') {
      setEditableText(langData.concise);
    } else if (activeFormat === 'detailed') {
      setEditableText(langData.detailed);
    } else if (activeFormat === 'social') {
      const hashtagStr = (altData.hashtags || []).join(' ');
      setEditableText(`${langData.concise}\n\n${hashtagStr}`);
    }
  }, [altData, activeLang, activeFormat]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!editableText) return;
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const charCount = editableText.length;
  const wordCount = editableText.trim() ? editableText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-md">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  AI Vision Alt-Text Generator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Multilingual
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Accessible screen-reader descriptions in English, Hindi & Hinglish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="relative">
                <Globe className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Analyzing meme visual context...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing facial expressions, captions & comedic irony in 3 languages
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchAltText}
                className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 rounded text-xs font-bold text-white transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Alt-Text Display */}
          {!isLoading && altData && (
            <div className="space-y-3.5">
              {/* Language Tabs: English, Hindi, Hinglish */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Select Language:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveLang('english')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeLang === 'english'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLang('hindi')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeLang === 'hindi'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>🇮🇳 हिंदी (Hindi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLang('hinglish')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeLang === 'hinglish'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>💬 Hinglish</span>
                  </button>
                </div>
              </div>

              {/* Format Type Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
                {[
                  { id: 'concise', label: '📌 Concise Alt-Text (~140 chars)', icon: FileText },
                  { id: 'detailed', label: '📖 Detailed Visual Description', icon: Eye },
                  { id: 'social', label: '📱 Social Post + Hashtags', icon: Share2 },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = activeFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setActiveFormat(fmt.id as FormatType)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Text Edit & Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Description Text (Editable):
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={charCount > 250 && activeFormat === 'concise' ? 'text-amber-400' : 'text-slate-400'}>
                      {charCount} characters
                    </span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>

                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans resize-y"
                  placeholder="Alt-text description will appear here..."
                />
              </div>

              {/* Suggested Hashtags */}
              {altData.hashtags && altData.hashtags.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <Hash className="w-3 h-3 text-amber-400" />
                    <span>Suggested Social Hashtags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {altData.hashtags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!editableText.includes(tag)) {
                            setEditableText((prev) => `${prev.trim()} ${tag}`);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 hover:text-amber-300 text-[10px] font-mono border border-slate-800 transition cursor-pointer hover:border-amber-400/50"
                        title="Click to insert tag into text"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={fetchAltText}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={isLoading || !editableText}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Alt-Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
