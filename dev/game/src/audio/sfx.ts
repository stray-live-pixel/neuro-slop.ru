// Процедурные звуки на WebAudio (без ассетов).
import { iconSVG } from '../ui/icons';

let actx: AudioContext | null = null;
let muted = false;

export function ensureAudio() {
  try { if (!actx) actx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { /* нет аудио — не страшно */ }
}

type SfxName = 'select' | 'command' | 'click' | 'build' | 'done' | 'train' | 'wave' | 'error' | 'hit';
const PRESETS: Record<string, [number, number, OscillatorType, number]> = {
  select: [660, 0.06, 'sine', 0.07], command: [430, 0.09, 'sine', 0.08], click: [540, 0.05, 'square', 0.05],
  build: [170, 0.15, 'sawtooth', 0.11], done: [820, 0.18, 'sine', 0.11], train: [720, 0.15, 'triangle', 0.1],
  wave: [130, 0.55, 'sawtooth', 0.16], error: [150, 0.13, 'square', 0.07], hit: [300, 0.05, 'square', 0.045],
};

export function sfx(name: SfxName | string) {
  if (muted || !actx) return;
  if (actx.state === 'suspended') actx.resume();
  const o = actx.createOscillator(), g = actx.createGain();
  o.connect(g); g.connect(actx.destination);
  const now = actx.currentTime;
  const P = PRESETS[name] || [440, 0.08, 'sine', 0.06];
  o.type = P[2]; o.frequency.setValueAtTime(P[0], now);
  if (name === 'wave') o.frequency.exponentialRampToValueAtTime(60, now + P[1]);
  if (name === 'done' || name === 'train') o.frequency.exponentialRampToValueAtTime(P[0] * 1.5, now + P[1]);
  g.gain.setValueAtTime(P[3], now); g.gain.exponentialRampToValueAtTime(0.0001, now + P[1]);
  o.start(now); o.stop(now + P[1] + 0.02);
}

export function toggleMute() {
  muted = !muted;
  const b = document.getElementById('muteBtn');
  if (b) b.innerHTML = iconSVG(muted ? 'mute' : 'sound', 18);
}
export const isMuted = () => muted;
