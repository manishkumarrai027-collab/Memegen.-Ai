export type MemeAnimationType = 'none' | 'bounce' | 'shake' | 'pulse' | 'spin' | 'wobble' | 'rainbow';

export interface MemeTextLayer {
  id: string;
  text: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  fontSize: number; // in px at standard resolution
  fontFamily: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
  align: 'left' | 'center' | 'right';
  rotation: number;
  hasBackground: boolean;
  backgroundColor: string;
  isTopOrBottom?: 'top' | 'bottom' | 'free';
  animation?: MemeAnimationType;
  animationDuration?: number; // in seconds, default 1.0
}

export interface MemeStickerLayer {
  id: string;
  stickerId: string;
  x: number; // percentage
  y: number; // percentage
  scale: number;
  rotation: number;
  animation?: MemeAnimationType;
  animationDuration?: number; // in seconds, default 1.0
  customImageUrl?: string;
}

export interface MemeFilters {
  brightness: number; // 50 - 150 (default 100)
  contrast: number; // 50 - 200 (default 100)
  saturation: number; // 0 - 250 (default 100)
  sepia: number; // 0 - 100 (default 0)
  grayscale: number; // 0 - 100 (default 0)
  deepFried: boolean; // extreme saturation & contrast
  invert: boolean;
}

export interface MagicCaptionItem {
  id: string;
  topText: string;
  bottomText: string;
  fullCaption: string;
  category: string;
  humorNote?: string;
}

export interface ImageAnalysisResult {
  sceneSummary: string;
  emotionalVibe: string;
  memePotentialScore: number;
  keySubjects: string[];
  comedicAngles: string[];
  recommendedFormat: string;
}

export interface SavedMeme {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
  attachedSound?: MemeSound;
}

export interface MemeSound {
  id: string;
  name: string;
  category: 'classic' | 'dank' | 'dramatic' | 'cartoon' | 'custom';
  description: string;
  emoji: string;
  duration: number; // in seconds
  soundType:
    | 'airhorn'
    | 'vine-boom'
    | 'sad-violin'
    | 'bruh'
    | 'sad-trombone'
    | 'dun-dun-dun'
    | 'record-scratch'
    | 'metal-pipe'
    | 'ding'
    | 'crickets'
    | 'custom';
  customAudioUrl?: string;
}

export type HeaderStyle = 'classic' | 'modern-twitter' | 'bottom-bar';

export interface TrendingMemeConcept {
  id: string;
  title: string;
  description: string;
  setupCaption: string;
  punchlineCaption: string;
  suggestedTemplateName: string;
  vibeBadge: string;
  viralityScore: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface TrendingMemesResponse {
  trendingMemes: TrendingMemeConcept[];
  searchQueries?: string[];
  sources?: GroundingSource[];
  groundedAt?: string;
}

export interface AltTextLanguageItem {
  concise: string;
  detailed: string;
}

export interface AltTextResult {
  english: AltTextLanguageItem;
  hindi: AltTextLanguageItem;
  hinglish: AltTextLanguageItem;
  hashtags: string[];
}
