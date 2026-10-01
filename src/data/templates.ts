export interface MemeTemplate {
  id: string;
  name: string;
  category: 'Classic' | 'Trending' | 'Work & Tech' | 'Reactions' | 'Animals';
  defaultTop: string;
  defaultBottom: string;
  thumbnail: string; // SVG data URI or crisp data URL
  tags: string[];
}

// Generate crisp, recognizable SVG illustrations for famous meme formats
function createMemeSvg(svgContent: string, width = 600, height = 500): string {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${svgContent}</svg>`;
  if (typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fullSvg)))}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(fullSvg).toString('base64')}`;
}

export const POPULAR_TEMPLATES: MemeTemplate[] = [
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    category: 'Classic',
    defaultTop: 'ME TRYING TO SLEEP',
    defaultBottom: 'A RANDOM EMBARRASSING MEMORY FROM 2014',
    tags: ['distracted', 'boyfriend', 'jealous', 'choice', 'temptation'],
    thumbnail: createMemeSvg(`
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="500" fill="url(#bg)"/>
      <rect x="0" y="380" width="600" height="120" fill="#0f172a"/>
      <!-- Angry Girlfriend (Left) -->
      <g transform="translate(90, 160)">
        <circle cx="50" cy="50" r="38" fill="#fda4af"/>
        <path d="M12 120 C12 80 88 80 88 120 Z" fill="#e11d48"/>
        <!-- Angry eyes -->
        <path d="M30 42 L45 48 M70 48 L55 42" stroke="#881337" stroke-width="4" stroke-linecap="round"/>
        <circle cx="36" cy="52" r="5" fill="#881337"/>
        <circle cx="64" cy="52" r="5" fill="#881337"/>
        <path d="M40 70 Q50 62 60 70" stroke="#881337" stroke-width="3" fill="none"/>
        <text x="50" y="165" font-family="Impact, sans-serif" font-size="16" fill="#fecdd3" text-anchor="middle">OFFENDED</text>
      </g>
      <!-- Distracted Guy (Center) -->
      <g transform="translate(260, 140)">
        <circle cx="50" cy="50" r="42" fill="#fde047"/>
        <path d="M8 140 C8 90 92 90 92 140 Z" fill="#2563eb"/>
        <!-- Whistling look back -->
        <circle cx="75" cy="48" r="6" fill="#1e3a8a"/>
        <circle cx="85" cy="48" r="6" fill="#1e3a8a"/>
        <ellipse cx="78" cy="65" rx="8" ry="4" fill="#1e3a8a"/>
        <path d="M60 38 Q75 32 88 40" stroke="#1e3a8a" stroke-width="3" fill="none"/>
        <text x="50" y="185" font-family="Impact, sans-serif" font-size="16" fill="#bfdbfe" text-anchor="middle">ME</text>
      </g>
      <!-- Walking girl in red (Right) -->
      <g transform="translate(430, 150)">
        <circle cx="50" cy="50" r="38" fill="#fcd34d"/>
        <path d="M15 130 C15 85 85 85 85 130 Z" fill="#ef4444"/>
        <path d="M30 48 Q40 54 50 48" stroke="#7f1d1d" stroke-width="3" fill="none"/>
        <circle cx="35" cy="44" r="5" fill="#7f1d1d"/>
        <text x="50" y="175" font-family="Impact, sans-serif" font-size="16" fill="#fecaca" text-anchor="middle">NEW SHINY THING</text>
      </g>
    `),
  },
  {
    id: 'drake-hotline',
    name: 'Drake Hotline Bling',
    category: 'Classic',
    defaultTop: 'FIXING MY SLEEP SCHEDULE',
    defaultBottom: 'STAYING UP TILL 3 AM BROWSING MEMES',
    tags: ['drake', 'reject', 'approve', 'yes', 'no', 'preference'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0f172a"/>
      <!-- Top Box (Dislike) -->
      <rect x="10" y="10" width="280" height="235" fill="#ea580c" rx="8"/>
      <g transform="translate(150, 110)">
        <circle cx="0" cy="0" r="45" fill="#fdba74"/>
        <path d="M-15 -10 L5 -18 M-15 5 Q0 -2 15 5" stroke="#7c2d12" stroke-width="4" fill="none"/>
        <line x1="-35" y1="20" x2="-70" y2="-10" stroke="#fdba74" stroke-width="16" stroke-linecap="round"/>
        <path d="M-70 -10 L-80 -25" stroke="#ea580c" stroke-width="6"/>
      </g>
      <rect x="300" y="10" width="290" height="235" fill="#1e293b" rx="8"/>
      <text x="445" y="130" font-family="Impact, sans-serif" font-size="28" fill="#ef4444" text-anchor="middle">NOPE / NAH</text>

      <!-- Bottom Box (Like) -->
      <rect x="10" y="255" width="280" height="235" fill="#16a34a" rx="8"/>
      <g transform="translate(150, 360)">
        <circle cx="0" cy="0" r="45" fill="#fed7aa"/>
        <!-- Smiling Drake pointing -->
        <circle cx="-10" cy="-5" r="5" fill="#7c2d12"/>
        <circle cx="15" cy="-5" r="5" fill="#7c2d12"/>
        <path d="M-15 15 Q2 30 18 15" stroke="#7c2d12" stroke-width="4" fill="none"/>
        <!-- Pointing finger -->
        <line x1="25" y1="20" x2="70" y2="0" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
      </g>
      <rect x="300" y="255" width="290" height="235" fill="#1e293b" rx="8"/>
      <text x="445" y="380" font-family="Impact, sans-serif" font-size="28" fill="#22c55e" text-anchor="middle">YES / THAT'S IT</text>
    `),
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons / Daily Struggle',
    category: 'Work & Tech',
    defaultTop: 'BUY GROCERIES & COOK AT HOME',
    defaultBottom: 'SPEND $45 ON FOOD DELIVERY AGAIN',
    tags: ['buttons', 'sweating', 'choice', 'dilemma', 'hard decision'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0f172a"/>
      <!-- Control panel with 2 red buttons -->
      <rect x="30" y="40" width="250" height="200" fill="#334155" rx="12"/>
      <ellipse cx="100" cy="140" rx="45" ry="30" fill="#dc2626"/>
      <ellipse cx="100" cy="135" rx="42" ry="26" fill="#ef4444"/>
      <ellipse cx="210" cy="140" rx="45" ry="30" fill="#dc2626"/>
      <ellipse cx="210" cy="135" rx="42" ry="26" fill="#ef4444"/>
      <text x="100" y="142" font-family="Impact, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">OPTION A</text>
      <text x="210" y="142" font-family="Impact, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">OPTION B</text>

      <!-- Guy sweating intensely -->
      <g transform="translate(420, 260)">
        <circle cx="0" cy="0" r="80" fill="#fed7aa"/>
        <!-- Eyes wide panic -->
        <circle cx="-30" cy="-10" r="18" fill="#ffffff"/>
        <circle cx="-30" cy="-10" r="8" fill="#0f172a"/>
        <circle cx="30" cy="-10" r="18" fill="#ffffff"/>
        <circle cx="30" cy="-10" r="8" fill="#0f172a"/>
        <!-- Intense sweat drops -->
        <path d="M-65 -40 Q-60 -20 -68 -15 Q-76 -20 -65 -40" fill="#38bdf8"/>
        <path d="M55 -30 Q60 -10 52 -5 Q44 -10 55 -30" fill="#38bdf8"/>
        <!-- Hand holding napkin -->
        <path d="M-60 40 Q0 80 60 40" stroke="#7c2d12" stroke-width="6" fill="none"/>
        <!-- Trembling mouth -->
        <path d="M-25 35 Q-10 42 0 35 Q10 28 25 35" stroke="#7c2d12" stroke-width="4" fill="none"/>
      </g>
    `),
  },
  {
    id: 'woman-yelling-cat',
    name: 'Woman Yelling at Cat',
    category: 'Trending',
    defaultTop: 'YOU PROMISED YOU WOULD ONLY BUY ONE THING',
    defaultBottom: 'THE CUTE CAT EATING SALAD AT THE DINNER TABLE',
    tags: ['woman', 'cat', 'salad', 'argument', 'yelling', 'smudge'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0f172a"/>
      <!-- Left side: Crying blonde woman pointing -->
      <rect x="10" y="10" width="285" height="480" fill="#1e293b" rx="10"/>
      <g transform="translate(150, 220)">
        <circle cx="0" cy="0" r="65" fill="#fde047"/>
        <path d="M-50 40 Q0 -60 50 40" stroke="#ca8a04" stroke-width="12" fill="none"/>
        <ellipse cx="-20" cy="-5" rx="8" ry="12" fill="#ef4444"/>
        <ellipse cx="20" cy="-5" rx="8" ry="12" fill="#ef4444"/>
        <path d="M-25 30 Q0 50 25 30" fill="#991b1b"/>
        <!-- Pointing hand -->
        <line x1="40" y1="40" x2="130" y2="10" stroke="#fde047" stroke-width="18" stroke-linecap="round"/>
        <text x="0" y="120" font-family="Impact, sans-serif" font-size="20" fill="#f87171" text-anchor="middle">OUTRAGED</text>
      </g>
      <!-- Right side: Smudge cat at table with salad -->
      <rect x="305" y="10" width="285" height="480" fill="#1e293b" rx="10"/>
      <g transform="translate(450, 240)">
        <polygon points="-50,-60 -30,-10 -65,-20" fill="#ffffff"/>
        <polygon points="50,-60 30,-10 65,-20" fill="#ffffff"/>
        <circle cx="0" cy="0" r="60" fill="#ffffff"/>
        <!-- Confused squinting cat face -->
        <ellipse cx="-20" cy="-5" rx="10" ry="6" fill="#1e293b"/>
        <ellipse cx="20" cy="-5" rx="10" ry="6" fill="#1e293b"/>
        <polygon points="-5,15 5,15 0,22" fill="#f472b6"/>
        <path d="M-15 25 Q0 20 15 25" stroke="#1e293b" stroke-width="3" fill="none"/>
        <!-- Salad bowl -->
        <ellipse cx="0" cy="80" rx="55" ry="20" fill="#15803d"/>
        <ellipse cx="0" cy="75" rx="50" ry="16" fill="#22c55e"/>
        <text x="0" y="120" font-family="Impact, sans-serif" font-size="20" fill="#4ade80" text-anchor="middle">JUST EATING SALAD</text>
      </g>
    `),
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain (4 Stages)',
    category: 'Trending',
    defaultTop: 'USING A CALCULATOR FOR 2 + 2',
    defaultBottom: 'JUST TO BE 100% SURE',
    tags: ['brain', 'galaxy', 'iq', 'intelligence', 'stages', 'ascended'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#020617"/>
      <!-- 4 Stages -->
      <g transform="translate(20, 20)">
        <!-- Stage 1 -->
        <rect x="0" y="0" width="180" height="100" fill="#1e293b" rx="8"/>
        <circle cx="90" cy="50" r="30" fill="#64748b"/>
        <rect x="190" y="0" width="370" height="100" fill="#0f172a" rx="8"/>
        <text x="210" y="58" font-family="Inter, sans-serif" font-weight="bold" font-size="18" fill="#94a3b8">Normal Thinking</text>

        <!-- Stage 2 -->
        <rect x="0" y="115" width="180" height="100" fill="#1e293b" rx="8"/>
        <circle cx="90" cy="165" r="32" fill="#3b82f6"/>
        <rect x="190" y="115" width="370" height="100" fill="#0f172a" rx="8"/>
        <text x="210" y="173" font-family="Inter, sans-serif" font-weight="bold" font-size="18" fill="#60a5fa">Big Brain Energy</text>

        <!-- Stage 3 -->
        <rect x="0" y="230" width="180" height="100" fill="#1e293b" rx="8"/>
        <circle cx="90" cy="280" r="34" fill="#a855f7"/>
        <rect x="190" y="230" width="370" height="100" fill="#0f172a" rx="8"/>
        <text x="210" y="288" font-family="Inter, sans-serif" font-weight="bold" font-size="18" fill="#c084fc">Cosmic Awareness</text>

        <!-- Stage 4 -->
        <rect x="0" y="345" width="180" height="100" fill="#1e293b" rx="8"/>
        <circle cx="90" cy="395" r="36" fill="#fbbf24"/>
        <rect x="190" y="345" width="370" height="100" fill="#0f172a" rx="8"/>
        <text x="210" y="403" font-family="Inter, sans-serif" font-weight="bold" font-size="18" fill="#fde047">Transcended God Form</text>
      </g>
    `),
  },
  {
    id: 'roll-safe-think',
    name: 'Roll Safe (Think About It)',
    category: 'Work & Tech',
    defaultTop: 'YOU CANNOT GET REJECTED',
    defaultBottom: 'IF YOU NEVER APPLY IN THE FIRST PLACE',
    tags: ['roll safe', 'smart', 'tapping head', 'brain', 'logic', 'galaxy brain'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#090d16"/>
      <g transform="translate(300, 250)">
        <circle cx="0" cy="0" r="100" fill="#935116"/>
        <!-- Smug smile -->
        <ellipse cx="-35" cy="-15" rx="14" ry="8" fill="#ffffff"/>
        <circle cx="-35" cy="-15" r="5" fill="#000000"/>
        <ellipse cx="25" cy="-15" rx="14" ry="8" fill="#ffffff"/>
        <circle cx="25" cy="-15" r="5" fill="#000000"/>
        <path d="M-30 35 Q0 55 35 30" stroke="#ffffff" stroke-width="6" fill="none"/>
        <!-- Leather jacket -->
        <path d="M-120 180 C-100 90 100 90 120 180 Z" fill="#1c1917"/>
        <!-- Index finger tapping temple -->
        <line x1="85" y1="40" x2="45" y2="-20" stroke="#935116" stroke-width="26" stroke-linecap="round"/>
        <circle cx="45" cy="-20" r="14" fill="#935116"/>
      </g>
      <text x="300" y="80" font-family="Impact, sans-serif" font-size="32" fill="#facc15" text-anchor="middle">CAN'T LOSE IF YOU DON'T PLAY</text>
    `),
  },
  {
    id: 'buff-doge-cheems',
    name: 'Buff Doge vs Cheems',
    category: 'Animals',
    defaultTop: 'PROGRAMMERS IN 1975 WRITING CODE FOR MOON MISSIONS',
    defaultBottom: 'ME IN 2026 CRYING BECAUSE CSS CENTER IS HARD',
    tags: ['doge', 'cheems', 'buff', 'weak', 'past vs present'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0f172a"/>
      <!-- Buff Doge (Left) -->
      <g transform="translate(180, 240)">
        <!-- Giant muscular body -->
        <ellipse cx="0" cy="40" rx="90" ry="75" fill="#d97706"/>
        <circle cx="-75" cy="0" r="45" fill="#b45309"/>
        <circle cx="75" cy="0" r="45" fill="#b45309"/>
        <!-- Doge head -->
        <circle cx="0" cy="-60" r="40" fill="#fbbf24"/>
        <circle cx="-12" cy="-65" r="6" fill="#1e293b"/>
        <circle cx="12" cy="-65" r="6" fill="#1e293b"/>
        <ellipse cx="0" cy="-50" rx="12" ry="8" fill="#1e293b"/>
        <text x="0" y="145" font-family="Impact, sans-serif" font-size="22" fill="#f59e0b" text-anchor="middle">GIGA DOGE (1990)</text>
      </g>
      <!-- Tiny Cheems (Right) -->
      <g transform="translate(450, 320)">
        <ellipse cx="0" cy="15" rx="55" ry="40" fill="#fde68a"/>
        <circle cx="0" cy="-25" r="32" fill="#fbbf24"/>
        <ellipse cx="-10" cy="-30" rx="5" ry="3" fill="#1e293b"/>
        <ellipse cx="10" cy="-30" rx="5" ry="3" fill="#1e293b"/>
        <polygon points="-4,-18 4,-18 0,-12" fill="#1e293b"/>
        <text x="0" y="85" font-family="Impact, sans-serif" font-size="20" fill="#fde68a" text-anchor="middle">smol cheems</text>
      </g>
    `),
  },
  {
    id: 'success-kid',
    name: 'Success Kid',
    category: 'Reactions',
    defaultTop: 'FIXED A BUG WITH A SINGLE LINE OF CODE',
    defaultBottom: 'DID NOT BREAK ANY OTHER FUNCTIONALITY',
    tags: ['success', 'kid', 'win', 'victory', 'fist pump', 'clench'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0284c7"/>
      <circle cx="300" cy="250" r="220" fill="#38bdf8" opacity="0.3"/>
      <!-- Sand & Beach -->
      <rect x="0" y="380" width="600" height="120" fill="#fef08a"/>
      <!-- Determined toddler -->
      <g transform="translate(300, 240)">
        <circle cx="0" cy="0" r="90" fill="#fed7aa"/>
        <!-- Green t-shirt with white collar -->
        <path d="M-80 90 C-80 50 80 50 80 90 L80 150 L-80 150 Z" fill="#15803d"/>
        <!-- Clenched fist in front -->
        <circle cx="-45" cy="55" r="35" fill="#fdbA74"/>
        <!-- Intense determined eyes & chubby cheeks -->
        <circle cx="-25" cy="-10" r="10" fill="#0f172a"/>
        <circle cx="25" cy="-10" r="10" fill="#0f172a"/>
        <path d="M-35 -25 L-15 -18 M35 -25 L15 -18" stroke="#7c2d12" stroke-width="4"/>
        <ellipse cx="0" cy="25" rx="14" ry="6" fill="#7c2d12"/>
      </g>
    `),
  },
  {
    id: 'disaster-girl',
    name: 'Disaster Girl',
    category: 'Classic',
    defaultTop: 'DELETING THE PROD DATABASE ON FRIDAY AT 4:59 PM',
    defaultBottom: 'WHILE TURNING OFF SLACK NOTIFICATIONS',
    tags: ['disaster', 'fire', 'smile', 'evil', 'girl', 'house fire'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#450a0a"/>
      <!-- Burning building flames in background -->
      <path d="M0 350 L80 180 L160 350 L240 140 L320 350 L400 120 L480 350 L560 160 L600 350 L600 500 L0 500 Z" fill="#ea580c"/>
      <path d="M40 350 L120 220 L200 350 L280 200 L360 350 L440 180 L520 350 L600 500 L0 500 Z" fill="#facc15"/>
      <!-- Evil Smirk Girl close up foreground -->
      <g transform="translate(180, 280)">
        <circle cx="0" cy="0" r="95" fill="#fed7aa"/>
        <!-- Side-eye knowing gaze -->
        <ellipse cx="-25" cy="-10" rx="14" ry="9" fill="#ffffff"/>
        <circle cx="-20" cy="-10" r="6" fill="#0f172a"/>
        <ellipse cx="30" cy="-10" rx="14" ry="9" fill="#ffffff"/>
        <circle cx="35" cy="-10" r="6" fill="#0f172a"/>
        <!-- Knowing smirk -->
        <path d="M-20 25 Q10 40 38 18" stroke="#7c2d12" stroke-width="5" stroke-linecap="round" fill="none"/>
      </g>
    `),
  },
  {
    id: 'trade-offer',
    name: 'Trade Offer',
    category: 'Trending',
    defaultTop: 'i receive: your undivided attention for 4 hours',
    defaultBottom: 'you receive: nothing, but we looked at memes',
    tags: ['trade', 'offer', 'deal', 'suit', 'tiktok', 'negotiation'],
    thumbnail: createMemeSvg(`
      <rect width="600" height="500" fill="#0f172a"/>
      <rect x="50" y="30" width="500" height="70" fill="#dc2626" rx="8"/>
      <text x="300" y="75" font-family="Impact, sans-serif" font-size="34" fill="#ffffff" text-anchor="middle">⚠️ TRADE OFFER ⚠️</text>
      <!-- Guy in suit holding hands open -->
      <g transform="translate(300, 290)">
        <circle cx="0" cy="-70" r="50" fill="#fed7aa"/>
        <path d="M-80 40 C-80 -20 80 -20 80 40 L90 120 L-90 120 Z" fill="#1e1b4b"/>
        <polygon points="-15,0 15,0 0,40" fill="#ef4444"/>
        <!-- Open hands offering deal -->
        <ellipse cx="-110" cy="20" rx="25" ry="18" fill="#fed7aa"/>
        <ellipse cx="110" cy="20" rx="25" ry="18" fill="#fed7aa"/>
      </g>
      <!-- Boxes for i receive / you receive -->
      <rect x="50" y="120" width="230" height="70" fill="#1e293b" rx="8"/>
      <text x="165" y="160" font-family="Inter, sans-serif" font-weight="900" font-size="18" fill="#38bdf8" text-anchor="middle">i receive:</text>
      <rect x="320" y="120" width="230" height="70" fill="#1e293b" rx="8"/>
      <text x="435" y="160" font-family="Inter, sans-serif" font-weight="900" font-size="18" fill="#a855f7" text-anchor="middle">you receive:</text>
    `),
  },
];
