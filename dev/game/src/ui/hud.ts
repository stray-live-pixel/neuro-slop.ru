// Верхняя панель ресурсов и индикатор волны.
import { G } from '../core/state';
import { TOTAL_WAVES } from '../data/config';
import { iconSVG } from './icons';

const el = (id: string) => document.getElementById(id);

const HUD_COL: Record<string, string> = { food: '#6f8f3a', wood: '#7a5230', stone: '#6b7078', gold: '#b9892f', pop: '#5b6b86' };

export function fmtTime(t: number): string {
  const m = (t / 60) | 0, s = (t % 60) | 0;
  return m + ':' + String(s).padStart(2, '0');
}

export function fillHudIcons() {
  document.querySelectorAll<HTMLElement>('.ic[data-icon]').forEach(s => s.innerHTML = iconSVG(s.dataset.icon!, 18, HUD_COL[s.dataset.icon!] || '#5a4634'));
  document.querySelectorAll<HTMLElement>('.mic[data-icon]').forEach(s => s.innerHTML = iconSVG(s.dataset.icon!, 22, '#4a3b28'));
  el('muteBtn')!.innerHTML = iconSVG('sound', 18);
  el('perfBtn')!.innerHTML = iconSVG('gauge', 18);
}

export function updateHUD() {
  el('rFood')!.textContent = String(Math.floor(G.res.food));
  el('rWood')!.textContent = String(Math.floor(G.res.wood));
  el('rStone')!.textContent = String(Math.floor(G.res.stone));
  el('rGold')!.textContent = String(Math.floor(G.res.gold));
  el('rPop')!.textContent = G.pop.used + '/' + G.pop.cap;
  el('rPop')!.className = G.pop.used >= G.pop.cap ? 'val warn' : 'val';
  const w = G.wave;
  if (w.state === 'prep') {
    el('waveInfo')!.innerHTML = `${iconSVG('clock', 15)} Волна <b>${w.index + 1}/${TOTAL_WAVES}</b> через <b>${Math.ceil(w.timer)}с</b>`;
    el('waveBox')!.className = '';
  } else {
    el('waveInfo')!.innerHTML = `${iconSVG('swords', 15)} ВОЛНА <b>${w.index}/${TOTAL_WAVES}</b> · врагов: <b>${w.alive}</b>`;
    el('waveBox')!.className = 'active';
  }
}
