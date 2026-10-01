/**
 * Web Audio API Sound Effects Synthesizer & Player
 * Generates classic meme sound effects entirely client-side with zero external assets/CORS dependencies
 */

import { MemeSound } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const MEME_SOUNDS: MemeSound[] = [
  {
    id: 'airhorn',
    name: 'Airhorn (MLG Blast)',
    category: 'dank',
    description: 'The iconic MLG triple reggae brass blast',
    emoji: '📢',
    duration: 1.2,
    soundType: 'airhorn',
  },
  {
    id: 'bruh',
    name: 'Bruh',
    category: 'classic',
    description: 'Resonant low vocal sound of utter disappointment',
    emoji: '🗿',
    duration: 0.9,
    soundType: 'bruh',
  },
  {
    id: 'sad-violin',
    name: 'Sad Violin',
    category: 'dramatic',
    description: 'Heart-wrenching mournful violin string melody',
    emoji: '🎻',
    duration: 3.2,
    soundType: 'sad-violin',
  },
  {
    id: 'vine-boom',
    name: 'Vine Boom',
    category: 'dank',
    description: 'Heavy bass thud that shakes the universe',
    emoji: '💥',
    duration: 1.1,
    soundType: 'vine-boom',
  },
  {
    id: 'dun-dun-dun',
    name: 'Dun Dun Dun!',
    category: 'dramatic',
    description: 'Three dramatic movie suspense stabs',
    emoji: '😱',
    duration: 2.0,
    soundType: 'dun-dun-dun',
  },
  {
    id: 'sad-trombone',
    name: 'Sad Trombone (Wah-Wah)',
    category: 'cartoon',
    description: 'Classic fail slide brass (Wah-wah-wah-waaaah)',
    emoji: '🎺',
    duration: 2.5,
    soundType: 'sad-trombone',
  },
  {
    id: 'record-scratch',
    name: 'Record Scratch',
    category: 'classic',
    description: '"Yup, that is me. You are probably wondering how I ended up here"',
    emoji: '💿',
    duration: 0.6,
    soundType: 'record-scratch',
  },
  {
    id: 'metal-pipe',
    name: 'Metal Pipe Falling',
    category: 'dank',
    description: 'Loud metallic resonance pipe crash echo',
    emoji: '🪈',
    duration: 1.5,
    soundType: 'metal-pipe',
  },
  {
    id: 'ding',
    name: 'Level Up Ding',
    category: 'cartoon',
    description: 'Crisp bright 8-bit victorious chime',
    emoji: '🔔',
    duration: 0.8,
    soundType: 'ding',
  },
  {
    id: 'crickets',
    name: 'Awkward Crickets',
    category: 'classic',
    description: 'Chirping silence after an uncomfortable joke',
    emoji: '🦗',
    duration: 2.0,
    soundType: 'crickets',
  },
];

let currentlyPlayingNodes: { stop: () => void } | null = null;

export function stopCurrentSound() {
  if (currentlyPlayingNodes) {
    try {
      currentlyPlayingNodes.stop();
    } catch {
      // ignore
    }
    currentlyPlayingNodes = null;
  }
}

/**
 * Play a meme sound with volume control (0.0 to 1.0)
 */
export function playMemeSound(sound: MemeSound, volume = 0.8): { stop: () => void } {
  stopCurrentSound();
  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  let activeSources: (AudioNode & { stop?: (when?: number) => void })[] = [];

  const handleStop = () => {
    activeSources.forEach((src) => {
      try {
        if ('stop' in src && typeof src.stop === 'function') {
          src.stop();
        }
      } catch {
        // ignore
      }
    });
    activeSources = [];
  };

  currentlyPlayingNodes = { stop: handleStop };

  if (sound.customAudioUrl) {
    const audio = new Audio(sound.customAudioUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((e) => console.warn('Audio play failed:', e));
    currentlyPlayingNodes = {
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
      },
    };
    return currentlyPlayingNodes;
  }

  const now = ctx.currentTime;

  switch (sound.soundType) {
    case 'airhorn': {
      // Classic MLG Airhorn: Rapid blasts with multi-oscillator detuned brass
      const blasts = [0, 0.16, 0.32, 0.52];
      const durations = [0.12, 0.12, 0.12, 0.45];
      const baseFreq = 466.16; // Bb4

      blasts.forEach((blastOffset, idx) => {
        const startTime = now + blastOffset;
        const dur = durations[idx];

        // 3 detuned sawtooth waves for rich horn sound
        [-8, 0, 7, 14].forEach((detune) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(baseFreq, startTime);
          osc.detune.setValueAtTime(detune, startTime);

          // Slight pitch envelope
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, startTime + 0.03);
          osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + dur);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
          gain.gain.setValueAtTime(0.2, startTime + dur - 0.02);
          gain.gain.linearRampToValueAtTime(0, startTime + dur);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + dur);
          activeSources.push(osc);
        });
      });
      break;
    }

    case 'bruh': {
      // Resonant deep formant filter simulation of "Bruh"
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      // Pitch contour: drops from ~130Hz to ~85Hz
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.65);

      // Formant vowel filter (/ʌ/ sound into /h/)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.5);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      gain.gain.linearRampToValueAtTime(0, now + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.8);
      activeSources.push(osc);
      break;
    }

    case 'vine-boom': {
      // Massive 808 Sub-Bass Impact with pitch drop and distortion
      const subOsc = ctx.createOscillator();
      const clickOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Deep sub bass dropping from 160Hz to 32Hz
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.5);

      // High click transient
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(350, now);
      clickOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(90, now + 0.9);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      subOsc.connect(filter);
      clickOsc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      subOsc.start(now);
      clickOsc.start(now);
      subOsc.stop(now + 1.1);
      clickOsc.stop(now + 0.1);
      activeSources.push(subOsc, clickOsc);
      break;
    }

    case 'sad-violin': {
      // Mournful violin vibrato melody notes (D5 - C#5 - C5 - B4)
      const notes = [
        { freq: 587.33, dur: 0.8, start: 0 },
        { freq: 554.37, dur: 0.7, start: 0.8 },
        { freq: 523.25, dur: 0.7, start: 1.5 },
        { freq: 493.88, dur: 1.1, start: 2.2 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        // Vibrato (5.5 Hz pitch wobble)
        vibrato.frequency.setValueAtTime(5.5, now + n.start);
        vibratoGain.gain.setValueAtTime(8.0, now + n.start);
        vibrato.connect(osc.detune);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + n.start);

        // Slow expressive violin bow attack & fade
        const sTime = now + n.start;
        noteGain.gain.setValueAtTime(0, sTime);
        noteGain.gain.linearRampToValueAtTime(0.22, sTime + 0.15);
        noteGain.gain.setValueAtTime(0.22, sTime + n.dur - 0.1);
        noteGain.gain.linearRampToValueAtTime(0, sTime + n.dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        vibrato.start(sTime);
        osc.start(sTime);
        vibrato.stop(sTime + n.dur);
        osc.stop(sTime + n.dur);
        activeSources.push(osc, vibrato);
      });
      break;
    }

    case 'dun-dun-dun': {
      // Three dramatic orchestral hits with increasing volume and pitch
      const hits = [
        { freq: 196.0, start: 0, dur: 0.35, vol: 0.3 }, // G3
        { freq: 220.0, start: 0.45, dur: 0.35, vol: 0.4 }, // A3
        { freq: 174.61, start: 0.95, dur: 0.9, vol: 0.6 }, // F3 (Low menacing doom)
      ];

      hits.forEach((h) => {
        const sTime = now + h.start;
        [0, 7, 12].forEach((interval) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(h.freq * Math.pow(2, interval / 12), sTime);

          gain.gain.setValueAtTime(h.vol, sTime);
          gain.gain.exponentialRampToValueAtTime(0.01, sTime + h.dur);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(sTime);
          osc.stop(sTime + h.dur);
          activeSources.push(osc);
        });
      });
      break;
    }

    case 'sad-trombone': {
      // Wah-wah-wah-waaaah (F - E - Eb - D slide)
      const notes = [
        { freq: 349.23, start: 0, dur: 0.4 }, // F4
        { freq: 329.63, start: 0.45, dur: 0.4 }, // E4
        { freq: 311.13, start: 0.9, dur: 0.4 }, // Eb4
        { freq: 293.66, endFreq: 260.0, start: 1.35, dur: 1.1 }, // D4 sliding down
      ];

      notes.forEach((n) => {
        const sTime = now + n.start;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, sTime);
        if (n.endFreq) {
          osc.frequency.linearRampToValueAtTime(n.endFreq, sTime + n.dur);
        }

        // Wah plunger mute effect (filter frequency modulation)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, sTime);
        filter.frequency.linearRampToValueAtTime(1100, sTime + 0.12);
        filter.frequency.linearRampToValueAtTime(450, sTime + n.dur);
        filter.Q.setValueAtTime(5.0, sTime);

        gain.gain.setValueAtTime(0.25, sTime);
        gain.gain.exponentialRampToValueAtTime(0.01, sTime + n.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(sTime);
        osc.stop(sTime + n.dur);
        activeSources.push(osc);
      });
      break;
    }

    case 'record-scratch': {
      // High-frequency noise burst with fast downward pitch envelope
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.4);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(now);
      noise.stop(now + 0.45);
      activeSources.push(noise);
      break;
    }

    case 'metal-pipe': {
      // Multiple inharmonic metallic modal frequencies ring down
      const freqs = [385, 742, 1180, 1640, 2250, 3100];
      const decays = [1.2, 0.9, 0.7, 0.5, 0.4, 0.3];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decays[i]);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decays[i]);
        activeSources.push(osc);
      });
      break;
    }

    case 'ding': {
      // Pleasant dual chime
      [1046.5, 2093.0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.8);
        activeSources.push(osc);
      });
      break;
    }

    case 'crickets': {
      // Periodic high-pitched chirps (4.8 kHz)
      const chirps = [0, 0.15, 0.3, 0.8, 0.95, 1.1];
      chirps.forEach((cOffset) => {
        const sTime = now + cOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4800, sTime);

        gain.gain.setValueAtTime(0.08, sTime);
        gain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(sTime);
        osc.stop(sTime + 0.08);
        activeSources.push(osc);
      });
      break;
    }
  }

  return currentlyPlayingNodes;
}
