export interface MemeSticker {
  id: string;
  name: string;
  svgContent: string;
}

export const STICKERS: MemeSticker[] = [
  {
    id: 'thug-glasses',
    name: 'Deal With It Glasses',
    svgContent: `
      <svg viewBox="0 0 160 50" width="100%" height="100%">
        <!-- Left lens -->
        <rect x="10" y="10" width="60" height="28" fill="#000000" rx="4"/>
        <rect x="14" y="14" width="8" height="8" fill="#ffffff"/>
        <rect x="24" y="22" width="6" height="6" fill="#ffffff"/>
        <!-- Bridge -->
        <rect x="68" y="18" width="24" height="8" fill="#000000"/>
        <!-- Right lens -->
        <rect x="90" y="10" width="60" height="28" fill="#000000" rx="4"/>
        <rect x="94" y="14" width="8" height="8" fill="#ffffff"/>
        <rect x="104" y="22" width="6" height="6" fill="#ffffff"/>
        <!-- Pixel dots -->
        <rect x="4" y="16" width="6" height="6" fill="#000000"/>
        <rect x="150" y="16" width="6" height="6" fill="#000000"/>
      </svg>
    `,
  },
  {
    id: 'laser-eyes',
    name: 'Red Laser Eyes Flare',
    svgContent: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="laserGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#ff0055"/>
            <stop offset="60%" stop-color="#ff0000" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ff0000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#laserGrad)"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#ff0055" stroke-width="6" stroke-linecap="round"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke="#ff0055" stroke-width="6" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="8" fill="#ffffff"/>
      </svg>
    `,
  },
  {
    id: 'no-u-card',
    name: 'Reverse UNO Card',
    svgContent: `
      <svg viewBox="0 0 80 110" width="100%" height="100%">
        <rect width="80" height="110" rx="8" fill="#2563eb" stroke="#ffffff" stroke-width="4"/>
        <ellipse cx="40" cy="55" rx="30" ry="42" fill="#ffffff" transform="rotate(-20 40 55)"/>
        <ellipse cx="40" cy="55" rx="26" ry="38" fill="#2563eb" transform="rotate(-20 40 55)"/>
        <path d="M30 45 L50 45 L42 35 M50 65 L30 65 L38 75" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="10" y="20" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff">↺</text>
        <text x="64" y="98" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff">↺</text>
      </svg>
    `,
  },
  {
    id: 'bruh-stamp',
    name: 'BRUH Stamp',
    svgContent: `
      <svg viewBox="0 0 140 60" width="100%" height="100%">
        <rect x="5" y="5" width="130" height="50" rx="6" fill="#dc2626" stroke="#ffffff" stroke-width="3" transform="rotate(-8 70 30)"/>
        <text x="70" y="40" font-family="Impact, sans-serif" font-size="32" fill="#ffffff" text-anchor="middle" transform="rotate(-8 70 30)">BRUH</text>
      </svg>
    `,
  },
  {
    id: 'crying-laughing',
    name: 'Crying Laughing Emoji',
    svgContent: `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="45" fill="#facc15"/>
        <!-- Tears -->
        <path d="M12 40 Q2 60 16 65 Q24 60 22 45 Z" fill="#38bdf8"/>
        <path d="M88 40 Q98 60 84 65 Q76 60 78 45 Z" fill="#38bdf8"/>
        <!-- Eyes squeezed shut -->
        <path d="M22 38 Q34 26 42 38" stroke="#713f12" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M78 38 Q66 26 58 38" stroke="#713f12" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- Open grinning mouth -->
        <path d="M25 55 Q50 85 75 55 Z" fill="#713f12"/>
        <path d="M30 55 Q50 72 70 55 Z" fill="#ffffff"/>
      </svg>
    `,
  },
  {
    id: 'cap-hat',
    name: 'Blue Baseball Cap (No Cap)',
    svgContent: `
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <ellipse cx="60" cy="45" rx="45" ry="22" fill="#1d4ed8"/>
        <!-- Visor -->
        <path d="M15 50 Q60 65 115 45 C115 55 90 68 15 50 Z" fill="#1e3a8a"/>
        <!-- Top button -->
        <circle cx="60" cy="22" r="5" fill="#1e3a8a"/>
      </svg>
    `,
  },
  {
    id: 'speech-bubble',
    name: 'Speech Bubble',
    svgContent: `
      <svg viewBox="0 0 140 90" width="100%" height="100%">
        <rect x="5" y="5" width="130" height="60" rx="16" fill="#ffffff" stroke="#0f172a" stroke-width="4"/>
        <polygon points="40,65 25,85 55,65" fill="#ffffff" stroke="#0f172a" stroke-width="4" stroke-linejoin="round"/>
        <rect x="36" y="60" width="22" height="8" fill="#ffffff"/>
        <text x="70" y="42" font-family="Inter, sans-serif" font-weight="bold" font-size="14" fill="#0f172a" text-anchor="middle">HELLO?!</text>
      </svg>
    `,
  },
  {
    id: 'fire-emoji',
    name: 'Lit Fire Flame',
    svgContent: `
      <svg viewBox="0 0 80 100" width="100%" height="100%">
        <path d="M40 5 C50 30 75 45 75 70 C75 90 60 98 40 98 C20 98 5 90 5 70 C5 48 30 25 40 5 Z" fill="#ea580c"/>
        <path d="M40 35 C48 50 62 60 62 76 C62 88 52 94 40 94 C28 94 18 88 18 76 C18 60 32 48 40 35 Z" fill="#facc15"/>
        <path d="M40 55 C44 65 52 72 52 82 C52 88 46 92 40 92 C34 92 28 88 28 82 C28 72 36 65 40 55 Z" fill="#ffffff"/>
      </svg>
    `,
  },
];
