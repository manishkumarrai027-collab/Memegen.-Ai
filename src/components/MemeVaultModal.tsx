import React from 'react';
import { SavedMeme } from '../types';
import { X, Download, Trash2, FolderHeart, Eye } from 'lucide-react';

interface MemeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMemes: SavedMeme[];
  onLoadMeme: (meme: SavedMeme) => void;
  onDeleteMeme: (id: string) => void;
}

export const MemeVaultModal: React.FC<MemeVaultModalProps> = ({
  isOpen,
  onClose,
  savedMemes,
  onLoadMeme,
  onDeleteMeme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <FolderHeart className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">My Meme Vault ({savedMemes.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedMemes.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-slate-400 text-sm">No saved memes yet in your vault!</p>
              <p className="text-slate-600 text-xs">
                Click "Save to Vault" in the editor header whenever you craft a masterpiece.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedMemes.map((m) => (
                <div
                  key={m.id}
                  className="group bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-400/80 overflow-hidden shadow-md transition flex flex-col"
                >
                  <div className="aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    <img src={m.dataUrl} alt={m.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs font-bold text-slate-200 truncate">{m.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={m.dataUrl}
                        download={`${m.title || 'meme'}.png`}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Download className="w-3 h-3 text-amber-400" />
                        Download
                      </a>
                      <button
                        onClick={() => onDeleteMeme(m.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
