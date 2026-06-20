/* ---- ВОЛНЫ ----
   Возвращает состав волны i (1..10): список юнитов врага и их усиление. */
import type { WaveComp } from '../core/types';

// Названия сторон захода орды (индекс = w.side, совпадает с раскладкой в startWave).
export const SIDE_NAME = ['севера', 'востока', 'юга', 'запада'];

export function waveComposition(i: number): WaveComp {
  const foot = 4 + i * 2;                     // пехота растёт
  const riders = i >= 4 ? Math.floor((i - 2) / 2) : 0;
  const hpScale = 1 + (i - 1) * 0.18;         // живучесть растёт
  const dmgScale = 1 + (i - 1) * 0.12;
  const list: string[] = [];
  for (let k = 0; k < foot; k++) list.push('mongol');
  for (let k = 0; k < riders; k++) list.push('rider');
  return { list, hpScale, dmgScale, reward: { gold: 40 + i * 15, stone: 20 } };
}
