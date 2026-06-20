// Волновой «режиссёр»: подготовка, запуск и подсчёт волн орды.
import { G } from '../core/state';
import { clamp } from '../core/iso';
import { MAP, TOTAL_WAVES } from '../data/config';
import { UNITS } from '../data/units';
import { waveComposition } from '../data/waves';
import { refund } from './economy';
import { spawnUnit } from './entities';
import { pickEnemyTarget } from './units';
import { endGame } from './gameover';
import { toast } from '../ui/toast';
import { sfx } from '../audio/sfx';

export function updateWaves(dt: number) {
  const w = G.wave;
  if (w.state === 'prep') {
    w.timer -= dt;
    if (w.timer <= 8 && !w.announced) { w.announced = true; toast('Волна ' + (w.index + 1) + ' на подходе! Готовь оборону!', 2.5); sfx('wave'); }
    if (w.timer <= 0) startWave();
  } else if (w.state === 'active') {
    w.alive = G.units.filter(u => u.side === 'enemy').length;
    if (w.alive === 0) {
      const comp = waveComposition(w.index);
      refund(comp.reward, 1);
      toast('Волна ' + w.index + ' отражена! Награда: +' + comp.reward.gold + ' золота', 2.5);
      if (w.index >= TOTAL_WAVES) { endGame(true); return; }
      w.state = 'prep'; w.timer = 165; w.announced = false;
    }
  }
}

export function startWave() {
  const w = G.wave; w.index++; w.state = 'active'; w.announced = false;
  const comp = waveComposition(w.index);
  const side = Math.floor(Math.random() * 4);
  comp.list.forEach((type) => {
    let x: number, y: number;
    const t = Math.floor(Math.random() * Math.max(MAP.W, MAP.H));
    if (side === 0) { x = clamp(t, 1, MAP.W - 2); y = 1; }
    else if (side === 1) { x = MAP.W - 2; y = clamp(t, 1, MAP.H - 2); }
    else if (side === 2) { x = clamp(t, 1, MAP.W - 2); y = MAP.H - 2; }
    else { x = 1; y = clamp(t, 1, MAP.H - 2); }
    for (let r = 0; r < 30 && G.solid[y][x]; r++) {
      x = clamp(x + (Math.random() < .5 ? 1 : -1), 1, MAP.W - 2);
      y = clamp(y + (Math.random() < .5 ? 1 : -1), 1, MAP.H - 2);
    }
    const u = spawnUnit(type, x, y, 'enemy');
    u.maxhp = Math.round(u.maxhp * comp.hpScale); u.hp = u.maxhp;
    u.def = Object.assign(Object.create(UNITS[type]), { dmg: Math.round(UNITS[type].dmg * comp.dmgScale) });
    pickEnemyTarget(u);
  });
  toast('ВОЛНА ' + w.index + ' из ' + TOTAL_WAVES + '! Орда: ' + comp.list.length + ' воинов', 3); sfx('wave');
}
