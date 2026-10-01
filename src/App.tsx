import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Eye,
  FolderHeart,
  RotateCcw,
  Check,
  LayoutGrid,
  Type,
  Sticker,
  Sliders,
  Flame,
  Plus,
  ArrowUpDown,
  Upload,
  Undo2,
  Redo2,
  Volume2,
  Play,
  Square,
  X,
} from 'lucide-react';
import { MemeCanvas } from './components/MemeCanvas';
import { MagicCaptionModal } from './components/MagicCaptionModal';
import { ImageAnalysisModal } from './components/ImageAnalysisModal';
import { AiImageGeneratorModal } from './components/AiImageGeneratorModal';
import { MemeVaultModal } from './components/MemeVaultModal';
import { AltTextModal } from './components/AltTextModal';
import { SoundSelectorPanel } from './components/SoundSelectorPanel';
import { TemplateSelector } from './components/TemplateSelector';
import { TextEditorPanel } from './components/TextEditorPanel';
import { StickerPanel } from './components/StickerPanel';
import { FilterPanel } from './components/FilterPanel';
import { POPULAR_TEMPLATES, MemeTemplate } from './data/templates';
import { MemeSticker } from './data/stickers';
import {
  MemeTextLayer,
  MemeStickerLayer,
  MemeFilters,
  HeaderStyle,
  MagicCaptionItem,
  SavedMeme,
  TrendingMemeConcept,
  MemeSound,
} from './types';
import { playMemeSound, stopCurrentSound } from './utils/soundEffects';
import { exportMemeToCanvas } from './utils/canvasExport';
import { useMemeHistory, MemeCanvasSnapshot } from './hooks/useMemeHistory';

const INITIAL_FILTERS: MemeFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  deepFried: false,
  invert: false,
};

export default function App() {
  // Meme Canvas State
  const defaultTemplate = POPULAR_TEMPLATES[0];
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(defaultTemplate.thumbnail);
  const [currentTemplateName, setCurrentTemplateName] = useState<string>(defaultTemplate.name);

  const [textLayers, setTextLayers] = useState<MemeTextLayer[]>([
    {
      id: 'top-text',
      text: defaultTemplate.defaultTop,
      x: 50,
      y: 10,
      fontSize: 34,
      fontFamily: 'Impact',
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      align: 'center',
      rotation: 0,
      hasBackground: false,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      isTopOrBottom: 'top',
    },
    {
      id: 'bottom-text',
      text: defaultTemplate.defaultBottom,
      x: 50,
      y: 90,
      fontSize: 34,
      fontFamily: 'Impact',
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      align: 'center',
      rotation: 0,
      hasBackground: false,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      isTopOrBottom: 'bottom',
    },
  ]);

  const [stickers, setStickers] = useState<MemeStickerLayer[]>([]);
  const [filters, setFilters] = useState<MemeFilters>(INITIAL_FILTERS);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('classic');
  const [attachedSound, setAttachedSound] = useState<MemeSound | null>(null);
  const [isPlayingCanvasSound, setIsPlayingCanvasSound] = useState<boolean>(false);
  const [autoPlayOnClick, setAutoPlayOnClick] = useState<boolean>(true);

  // History & Undo / Redo Management
  const currentSnapshot: MemeCanvasSnapshot = {
    imageSrc: currentImageSrc,
    templateName: currentTemplateName,
    textLayers,
    stickers,
    filters,
    headerStyle,
    attachedSound,
  };

  const {
    recordChange,
    undo: performUndo,
    redo: performRedo,
    canUndo,
    canRedo,
  } = useMemeHistory(currentSnapshot);

  const applySnapshot = useCallback((snapshot: MemeCanvasSnapshot) => {
    setCurrentImageSrc(snapshot.imageSrc);
    setCurrentTemplateName(snapshot.templateName);
    setTextLayers(snapshot.textLayers);
    setStickers(snapshot.stickers);
    setFilters(snapshot.filters);
    setHeaderStyle(snapshot.headerStyle);
    setAttachedSound(snapshot.attachedSound || null);
  }, []);

  const handlePlayAttachedSound = useCallback(() => {
    if (!attachedSound) return;
    if (isPlayingCanvasSound) {
      stopCurrentSound();
      setIsPlayingCanvasSound(false);
    } else {
      setIsPlayingCanvasSound(true);
      playMemeSound(attachedSound, 0.85);
      setTimeout(() => {
        setIsPlayingCanvasSound(false);
      }, attachedSound.duration * 1000 + 100);
    }
  }, [attachedSound, isPlayingCanvasSound]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      performUndo(applySnapshot);
      showToast('↩️ Undone edit');
    }
  }, [canUndo, performUndo, applySnapshot]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      performRedo(applySnapshot);
      showToast('↪️ Redone edit');
    }
  }, [canRedo, performRedo, applySnapshot]);

  // Keyboard Shortcuts for Undo (Ctrl/Cmd+Z) and Redo (Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Selection & UI state
  const [selectedTextId, setSelectedTextId] = useState<string | null>('top-text');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'templates' | 'text' | 'stickers' | 'filters' | 'sounds'>('text');

  // Modals state
  const [isMagicCaptionOpen, setIsMagicCaptionOpen] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAltTextOpen, setIsAltTextOpen] = useState(false);

  // Saved memes in local storage
  const [savedMemes, setSavedMemes] = useState<SavedMeme[]>(() => {
    try {
      const stored = localStorage.getItem('ai_memegen_vault');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Listen to paste event (e.g. Ctrl+V to paste an image from clipboard directly!)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleUploadImage(file);
            showToast('Image pasted from clipboard!');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Save vault changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_memegen_vault', JSON.stringify(savedMemes));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [savedMemes]);

  // Handle template selection
  const handleSelectTemplate = (template: MemeTemplate) => {
    recordChange();
    setCurrentImageSrc(template.thumbnail);
    setCurrentTemplateName(template.name);
    setTextLayers((prev) =>
      prev.map((layer) => {
        if (layer.isTopOrBottom === 'top') {
          return { ...layer, text: template.defaultTop };
        }
        if (layer.isTopOrBottom === 'bottom') {
          return { ...layer, text: template.defaultBottom };
        }
        return layer;
      })
    );
    setStickers([]);
    setFilters(INITIAL_FILTERS);
    setActiveSidebarTab('text');
    showToast(`Loaded "${template.name}" template!`);
  };

  // Handle starting a project from a Google Search grounded viral trend
  const handleSelectTrendingTrend = (trend: TrendingMemeConcept, template: MemeTemplate) => {
    recordChange();
    setCurrentImageSrc(template.thumbnail);
    setCurrentTemplateName(trend.title || template.name);
    setTextLayers((prev) =>
      prev.map((layer) => {
        if (layer.isTopOrBottom === 'top') {
          return { ...layer, text: trend.setupCaption };
        }
        if (layer.isTopOrBottom === 'bottom') {
          return { ...layer, text: trend.punchlineCaption };
        }
        return layer;
      })
    );
    setStickers([]);
    setFilters(INITIAL_FILTERS);
    setActiveSidebarTab('text');
    showToast(`🔥 Started "${trend.title}" with live viral trend!`);
  };

  // Handle file upload
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        recordChange();
        setCurrentImageSrc(result);
        setCurrentTemplateName(file.name.replace(/\.[^/.]+$/, ''));
        setStickers([]);
        setFilters(INITIAL_FILTERS);
        setActiveSidebarTab('text');
        showToast('Photo uploaded! Ready for Magic Caption.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Text Layer actions
  const handleUpdateTextLayer = (id: string, updates: Partial<MemeTextLayer>) => {
    setTextLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleAddFreeformText = () => {
    recordChange();
    const newId = `free-${Date.now()}`;
    const newLayer: MemeTextLayer = {
      id: newId,
      text: 'NEW TEXT',
      x: 50,
      y: 50,
      fontSize: 28,
      fontFamily: 'Impact',
      fillColor: '#facc15',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      align: 'center',
      rotation: 0,
      hasBackground: false,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      isTopOrBottom: 'free',
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextId(newId);
    showToast('Added new text layer! Drag it anywhere on canvas.');
  };

  const handleDeleteTextLayer = (id: string) => {
    recordChange();
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleSwapTopBottom = () => {
    recordChange();
    setTextLayers((prev) => {
      const top = prev.find((l) => l.isTopOrBottom === 'top');
      const bottom = prev.find((l) => l.isTopOrBottom === 'bottom');
      if (!top || !bottom) return prev;
      return prev.map((l) => {
        if (l.id === top.id) return { ...l, text: bottom.text };
        if (l.id === bottom.id) return { ...l, text: top.text };
        return l;
      });
    });
    showToast('Swapped Top and Bottom captions!');
  };

  // Sticker actions
  const handleAddSticker = (stickerDef: MemeSticker) => {
    recordChange();
    const newSticker: MemeStickerLayer = {
      id: `stk-${Date.now()}`,
      stickerId: stickerDef.id,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    showToast(`Added ${stickerDef.name}! Drag to position.`);
  };

  const handleUpdateStickerLayer = (id: string, updates: Partial<MemeStickerLayer>) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteSticker = (id: string) => {
    recordChange();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Background Removal Handlers
  const handleApplyCutoutImage = (newImageSrc: string) => {
    recordChange();
    setCurrentImageSrc(newImageSrc);
    showToast('✂️ Applied transparent cutout to canvas!');
  };

  const handleAddCutoutAsSticker = (cutoutDataUrl: string) => {
    recordChange();
    const newSticker: MemeStickerLayer = {
      id: `cutout-${Date.now()}`,
      stickerId: 'custom-cutout',
      customImageUrl: cutoutDataUrl,
      x: 50,
      y: 50,
      scale: 1.2,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    showToast('✂️ Added extracted subject as movable sticker!');
  };

  // Magic Caption Application
  const handleApplyMagicCaption = (caption: MagicCaptionItem) => {
    recordChange();
    setTextLayers((prev) =>
      prev.map((layer) => {
        if (layer.isTopOrBottom === 'top') {
          return {
            ...layer,
            text: caption.topText || caption.fullCaption,
          };
        }
        if (layer.isTopOrBottom === 'bottom') {
          return {
            ...layer,
            text: caption.bottomText || '',
          };
        }
        return layer;
      })
    );
    showToast('✨ Magic Caption applied to your meme!');
  };

  // Export Meme
  const generateExportCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!imageElementRef.current) return null;
    return await exportMemeToCanvas(
      imageElementRef.current,
      textLayers,
      stickers,
      filters,
      headerStyle
    );
  };

  const getCompletedMemeBase64 = async (): Promise<string | null> => {
    const canvas = await generateExportCanvas();
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const handleDownload = async (format: 'png' | 'jpeg' = 'png') => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error('Could not render meme canvas');

      const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `${currentTemplateName.toLowerCase().replace(/\s+/g, '-')}-meme.${format}`;
      link.href = dataUrl;
      link.click();
      showToast(`Downloaded as high-res ${format.toUpperCase()}!`);
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error('Could not render meme canvas');

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Could not generate image blob');
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          showToast('📋 Copied image directly to clipboard! Paste into Discord/Slack.');
        } catch {
          showToast('Clipboard access was blocked by browser. Please use Download instead.');
        }
      }, 'image/png');
    } catch (err: any) {
      console.error('Clipboard copy error:', err);
      showToast('Could not copy to clipboard.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToVault = async () => {
    try {
      const canvas = await generateExportCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const newEntry: SavedMeme = {
        id: `meme-${Date.now()}`,
        title: currentTemplateName,
        dataUrl,
        createdAt: new Date().toISOString(),
        attachedSound: attachedSound || undefined,
      };
      setSavedMemes((prev) => [newEntry, ...prev]);
      showToast('💾 Saved meme to your vault!');
    } catch (err) {
      console.error('Save to vault error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">MemeGen AI</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                Gemini 3.1 Pro Vision
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              AI-Powered Meme Studio with Vision Captioning & Scene Understanding
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo Action Group */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${
                canUndo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="Undo change (Ctrl+Z / Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Undo</span>
            </button>
            <div className="w-[1px] h-4 bg-slate-800 my-auto" />
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${
                canRedo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="Redo change (Ctrl+Y / Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Redo</span>
            </button>
          </div>

          {/* Flagship MAGIC CAPTION Button */}
          <button
            onClick={() => setIsMagicCaptionOpen(true)}
            className="group relative px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-amber-400/50"
          >
            <Wand2 className="w-4 h-4 animate-spin text-slate-950" style={{ animationDuration: '6s' }} />
            <span>Magic Caption</span>
            <span className="hidden lg:inline-block px-1.5 py-0.2 bg-black/20 text-slate-950 rounded text-[9px]">
              AI 3.1
            </span>
          </button>

          {/* AI Analyze Image */}
          <button
            onClick={() => setIsImageAnalysisOpen(true)}
            title="Analyze Image Context with Gemini 3.1 Pro"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 hover:border-blue-400 text-blue-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Analyze</span>
          </button>

          {/* Vault Drawer Button */}
          <button
            onClick={() => setIsVaultOpen(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition relative"
            title="My Meme Vault"
          >
            <FolderHeart className="w-4 h-4 text-amber-400" />
            {savedMemes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {savedMemes.length}
              </span>
            )}
          </button>

          {/* Save to Vault */}
          <button
            onClick={handleSaveToVault}
            title="Save current meme to Vault"
            className="hidden md:flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
            <span>Save</span>
          </button>

          {/* AI Alt-Text Description Generator */}
          <button
            onClick={() => setIsAltTextOpen(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            title="Generate AI Alt-Text Description in English, Hindi, and Hinglish"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Alt-Text</span>
            <span className="sm:hidden">Alt</span>
            <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300 font-mono hidden md:inline">
              EN/HI
            </span>
          </button>

          {/* Quick Copy to Clipboard */}
          <button
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            title="Copy image directly to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>Copy</span>
          </button>

          {/* Download Button */}
          <button
            onClick={() => handleDownload('png')}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left / Center Area: Canvas & Floating Controls */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 p-3 sm:p-5 relative border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Quick Toolbar above canvas */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 truncate max-w-xs">
                {currentTemplateName}
              </span>
              <button
                onClick={() => {
                  recordChange();
                  setHeaderStyle(headerStyle === 'classic' ? 'modern-twitter' : 'classic');
                }}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition cursor-pointer ${
                  headerStyle === 'modern-twitter'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {headerStyle === 'modern-twitter' ? 'Twitter Header' : 'Classic Meme'}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Undo & Redo Buttons */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-sm">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={`p-1.5 rounded transition ${
                    canUndo
                      ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95'
                      : 'text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-slate-800 my-auto" />
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={`p-1.5 rounded transition ${
                    canRedo
                      ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-95'
                      : 'text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleSwapTopBottom}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title="Swap Top and Bottom text"
              >
                <ArrowUpDown className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Swap Text</span>
              </button>

              <button
                onClick={() => {
                  recordChange();
                  setTextLayers([
                    {
                      id: 'top-text',
                      text: '',
                      x: 50,
                      y: 10,
                      fontSize: 34,
                      fontFamily: 'Impact',
                      fillColor: '#ffffff',
                      strokeColor: '#000000',
                      strokeWidth: 4,
                      isUppercase: true,
                      align: 'center',
                      rotation: 0,
                      hasBackground: false,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      isTopOrBottom: 'top',
                    },
                    {
                      id: 'bottom-text',
                      text: '',
                      x: 50,
                      y: 90,
                      fontSize: 34,
                      fontFamily: 'Impact',
                      fillColor: '#ffffff',
                      strokeColor: '#000000',
                      strokeWidth: 4,
                      isUppercase: true,
                      align: 'center',
                      rotation: 0,
                      hasBackground: false,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      isTopOrBottom: 'bottom',
                    },
                  ]);
                  setStickers([]);
                  setFilters(INITIAL_FILTERS);
                  showToast('Cleared text & stickers');
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                title="Reset text and stickers"
              >
                Clear
              </button>
            </div>
          </div>

          {/* WYSIWYG Meme Canvas */}
          <div className="flex-1 flex items-center justify-center min-h-[380px] bg-slate-900/40 rounded-2xl border border-slate-800/80 p-2 relative overflow-hidden">
            <MemeCanvas
              imageSrc={currentImageSrc}
              textLayers={textLayers}
              stickers={stickers}
              filters={filters}
              headerStyle={headerStyle}
              selectedTextId={selectedTextId}
              onSelectText={setSelectedTextId}
              onUpdateTextLayer={handleUpdateTextLayer}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
              onUpdateStickerLayer={handleUpdateStickerLayer}
              onDeleteSticker={handleDeleteSticker}
              onDragStart={recordChange}
              canvasRef={canvasContainerRef}
              imgRef={imageElementRef}
            />

            {/* Floating Attached Sound Widget on Canvas */}
            {attachedSound && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 p-1.5 px-3 bg-slate-950/90 border border-amber-400/60 rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
                <span className="text-lg select-none">{attachedSound.emoji}</span>
                <div className="leading-tight">
                  <span className="text-xs font-black text-white block max-w-[120px] truncate">
                    {attachedSound.name}
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    {isPlayingCanvasSound ? '🔊 Playing...' : 'Attached Sound'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePlayAttachedSound}
                  className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold transition shadow cursor-pointer ml-1"
                  title="Play attached meme sound"
                >
                  {isPlayingCanvasSound ? (
                    <Square className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    recordChange();
                    setAttachedSound(null);
                    showToast('Detached sound effect');
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                  title="Remove sound"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick floating AI buttons directly on the canvas */}
            <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
              <button
                onClick={() => setIsMagicCaptionOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition hover:scale-105 cursor-pointer backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Magic Caption (5 AI Ideas)</span>
              </button>

              <button
                onClick={() => setIsAltTextOpen(true)}
                className="hidden sm:flex px-3 py-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-400/60 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center gap-1.5 transition hover:scale-105 cursor-pointer backdrop-blur-sm"
                title="Generate accessibility alt-text in English, Hindi, and Hinglish"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Alt-Text (EN/HI)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Control Tabs (Templates, Text, Stickers, Filters, Sounds) */}
        <div className="lg:col-span-4 bg-slate-900/80 flex flex-col h-full border-slate-800 overflow-hidden">
          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveSidebarTab('text')}
              className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                activeSidebarTab === 'text'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px]">Captions</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('templates')}
              className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                activeSidebarTab === 'templates'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px]">Templates</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('stickers')}
              className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                activeSidebarTab === 'stickers'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sticker className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px]">Stickers</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('filters')}
              className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                activeSidebarTab === 'filters'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px]">FX</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('sounds')}
              className={`py-2 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition relative ${
                activeSidebarTab === 'sounds'
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] flex items-center gap-1">
                SFX
                {attachedSound && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSidebarTab === 'text' && (
              <TextEditorPanel
                textLayers={textLayers}
                selectedTextId={selectedTextId}
                onSelectText={setSelectedTextId}
                onUpdateTextLayer={handleUpdateTextLayer}
                onAddFreeformText={handleAddFreeformText}
                onDeleteTextLayer={handleDeleteTextLayer}
                onSwapTopBottom={handleSwapTopBottom}
                headerStyle={headerStyle}
                onToggleHeaderStyle={() => {
                  recordChange();
                  setHeaderStyle(headerStyle === 'classic' ? 'modern-twitter' : 'classic');
                }}
                onRecordChange={recordChange}
              />
            )}

            {activeSidebarTab === 'templates' && (
              <TemplateSelector
                onSelectTemplate={handleSelectTemplate}
                onUploadImage={handleUploadImage}
                onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
                onSelectTrendingTrend={handleSelectTrendingTrend}
              />
            )}

            {activeSidebarTab === 'stickers' && (
              <StickerPanel
                onAddSticker={handleAddSticker}
                stickers={stickers}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onUpdateStickerLayer={handleUpdateStickerLayer}
                onDeleteSticker={handleDeleteSticker}
                onRecordChange={recordChange}
              />
            )}

            {activeSidebarTab === 'filters' && (
              <FilterPanel
                filters={filters}
                onUpdateFilters={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
                onResetFilters={() => setFilters(INITIAL_FILTERS)}
                onRecordChange={recordChange}
                textLayers={textLayers}
                stickers={stickers}
                selectedTextId={selectedTextId}
                selectedStickerId={selectedStickerId}
                onSelectText={setSelectedTextId}
                onSelectSticker={setSelectedStickerId}
                onUpdateTextLayer={handleUpdateTextLayer}
                onUpdateStickerLayer={handleUpdateStickerLayer}
                currentImageSrc={currentImageSrc}
                onApplyCutoutImage={handleApplyCutoutImage}
                onAddCutoutAsSticker={handleAddCutoutAsSticker}
                onOpenAltText={() => setIsAltTextOpen(true)}
              />
            )}

            {activeSidebarTab === 'sounds' && (
              <SoundSelectorPanel
                attachedSound={attachedSound}
                onAttachSound={(sound) => {
                  recordChange();
                  setAttachedSound(sound);
                  if (sound) {
                    showToast(`🔊 Attached "${sound.name}" to meme!`);
                  } else {
                    showToast('Detached sound');
                  }
                }}
                onRecordChange={recordChange}
                autoPlayOnClick={autoPlayOnClick}
                onToggleAutoPlay={setAutoPlayOnClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-400/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AltTextModal
        isOpen={isAltTextOpen}
        onClose={() => setIsAltTextOpen(false)}
        getMemeImageBase64={getCompletedMemeBase64}
        memeTitle={currentTemplateName}
        captionsContext={textLayers
          .map((l) => `${l.isTopOrBottom || 'text'}: "${l.text}"`)
          .filter(Boolean)
          .join(' | ')}
      />

      <MagicCaptionModal
        isOpen={isMagicCaptionOpen}
        onClose={() => setIsMagicCaptionOpen(false)}
        imageSrc={currentImageSrc}
        onApplyCaption={handleApplyMagicCaption}
      />

      <ImageAnalysisModal
        isOpen={isImageAnalysisOpen}
        onClose={() => setIsImageAnalysisOpen(false)}
        imageSrc={currentImageSrc}
        onTriggerMagicCaptions={() => setIsMagicCaptionOpen(true)}
      />

      <AiImageGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        currentImageSrc={currentImageSrc}
        onSelectImage={(newSrc) => {
          recordChange();
          setCurrentImageSrc(newSrc);
          setCurrentTemplateName('AI Generated Meme');
          showToast('Loaded AI generated image onto canvas!');
        }}
      />

      <MemeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        savedMemes={savedMemes}
        onLoadMeme={(meme) => {
          recordChange();
          setCurrentImageSrc(meme.dataUrl);
          setCurrentTemplateName(meme.title);
          setAttachedSound(meme.attachedSound || null);
          setIsVaultOpen(false);
          showToast(`Re-opened "${meme.title}" from vault!`);
        }}
        onDeleteMeme={(id) => {
          setSavedMemes((prev) => prev.filter((m) => m.id !== id));
          showToast('Removed meme from vault');
        }}
      />
    </div>
  );
}
