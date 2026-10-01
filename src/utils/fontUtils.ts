export interface FontPreset {
  id: string;
  name: string;
  tag: string;
  fontFamily: string;
  cssFamily: string;
  previewText: string;
  badgeColor: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'Impact',
    name: 'Impact',
    tag: 'Classic Meme',
    fontFamily: 'Impact',
    cssFamily: '"Impact", "Anton", sans-serif',
    previewText: 'IMPACT',
    badgeColor: 'bg-amber-400 text-slate-950',
  },
  {
    id: 'Comic Sans',
    name: 'Comic Sans',
    tag: 'Doge & Irony',
    fontFamily: 'Comic Sans',
    cssFamily: '"Comic Sans MS", "Comic Neue", cursive, sans-serif',
    previewText: 'Comic Sans',
    badgeColor: 'bg-emerald-400 text-slate-950',
  },
  {
    id: 'Montserrat',
    name: 'Montserrat',
    tag: 'Modern & Clean',
    fontFamily: 'Montserrat',
    cssFamily: '"Montserrat", sans-serif',
    previewText: 'Montserrat',
    badgeColor: 'bg-sky-400 text-slate-950',
  },
  {
    id: 'Courier',
    name: 'Courier',
    tag: 'Typewriter / Code',
    fontFamily: 'Courier',
    cssFamily: '"Courier Prime", "Courier New", Courier, monospace',
    previewText: 'Courier',
    badgeColor: 'bg-purple-400 text-slate-950',
  },
  {
    id: 'Anton',
    name: 'Anton',
    tag: 'Heavy Punchy',
    fontFamily: 'Anton',
    cssFamily: '"Anton", Impact, sans-serif',
    previewText: 'ANTON',
    badgeColor: 'bg-orange-400 text-slate-950',
  },
  {
    id: 'Bangers',
    name: 'Bangers',
    tag: 'Comic Book',
    fontFamily: 'Bangers',
    cssFamily: '"Bangers", cursive, sans-serif',
    previewText: 'BANGERS',
    badgeColor: 'bg-red-400 text-slate-950',
  },
  {
    id: 'Permanent Marker',
    name: 'Permanent Marker',
    tag: 'Graffiti / Sharpie',
    fontFamily: 'Permanent Marker',
    cssFamily: '"Permanent Marker", cursive, sans-serif',
    previewText: 'Marker',
    badgeColor: 'bg-pink-400 text-slate-950',
  },
  {
    id: 'Space Grotesk',
    name: 'Space Grotesk',
    tag: 'Tech & Futuristic',
    fontFamily: 'Space Grotesk',
    cssFamily: '"Space Grotesk", sans-serif',
    previewText: 'Space Grotesk',
    badgeColor: 'bg-indigo-400 text-slate-950',
  },
];

export function getFontFamilyCss(fontName: string): string {
  const match = FONT_PRESETS.find(
    (p) =>
      p.id.toLowerCase() === fontName.toLowerCase() ||
      p.fontFamily.toLowerCase() === fontName.toLowerCase()
  );
  if (match) {
    return match.cssFamily;
  }
  // Generic fallbacks
  if (fontName.toLowerCase().includes('comic')) {
    return '"Comic Sans MS", "Comic Neue", cursive, sans-serif';
  }
  if (fontName.toLowerCase().includes('courier')) {
    return '"Courier Prime", "Courier New", Courier, monospace';
  }
  if (fontName.toLowerCase().includes('montserrat')) {
    return '"Montserrat", sans-serif';
  }
  return `"${fontName}", Impact, sans-serif`;
}
