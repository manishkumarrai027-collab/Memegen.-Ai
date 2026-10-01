import { MemeAnimationType } from '../types';

export interface AnimationOption {
  id: MemeAnimationType;
  label: string;
  tag: string;
  description: string;
  keyframeName: string;
  timingFunction: string;
}

export const ANIMATION_OPTIONS: AnimationOption[] = [
  {
    id: 'none',
    label: 'None',
    tag: 'Static',
    description: 'No animation',
    keyframeName: 'none',
    timingFunction: 'linear',
  },
  {
    id: 'bounce',
    label: 'Bounce',
    tag: 'Classic',
    description: 'Cartoon jump & bounce effect',
    keyframeName: 'memeBounce',
    timingFunction: 'ease-in-out',
  },
  {
    id: 'shake',
    label: 'Shake',
    tag: 'Rage/Panic',
    description: 'Intense trembling rage vibration',
    keyframeName: 'memeShake',
    timingFunction: 'linear',
  },
  {
    id: 'pulse',
    label: 'Pulse',
    tag: 'Glow Beat',
    description: 'Breathing heartbeat scale',
    keyframeName: 'memePulse',
    timingFunction: 'ease-in-out',
  },
  {
    id: 'wobble',
    label: 'Wobble',
    tag: 'Sway',
    description: 'Pendulum tilt & rock',
    keyframeName: 'memeWobble',
    timingFunction: 'ease-in-out',
  },
  {
    id: 'spin',
    label: 'Spin',
    tag: '360°',
    description: 'Continuous smooth spin',
    keyframeName: 'memeSpin',
    timingFunction: 'linear',
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    tag: 'Psychedelic',
    description: 'Hue-shifting glowing aura',
    keyframeName: 'memeRainbow',
    timingFunction: 'linear',
  },
];

export function getAnimationCss(type?: MemeAnimationType, duration = 1.0): string {
  if (!type || type === 'none') return 'none';
  const opt = ANIMATION_OPTIONS.find((o) => o.id === type);
  if (!opt || opt.keyframeName === 'none') return 'none';
  return `${opt.keyframeName} ${Math.max(0.1, duration)}s infinite ${opt.timingFunction}`;
}
