// Главный шаг симуляции (фиксированный timestep).
import { G } from '../core/state';
import { computePopUsed } from './entities';
import { updateWaves } from './waves';
import { updateUnit } from './units';
import { separateUnits } from './separation';
import { updateBuilding } from './buildings';
import { updateProjectiles } from './combat';
import { endGame } from './gameover';

export function update(dt: number) {
  if (G.over) return;
  G.time += dt;
  computePopUsed();
  updateWaves(dt);
  for (const u of G.units) updateUnit(u, dt);
  separateUnits(dt);
  for (const b of G.buildings) updateBuilding(b, dt);
  updateProjectiles(dt);
  // чистка мёртвых
  G.units = G.units.filter(u => {
    if (u.hp > 0) return true;
    G.selection = G.selection.filter(s => s !== u);
    G.fx.push({ x: u.gx, y: u.gy, t: 0, life: 0.5, type: 'die' });
    return false;
  });
  for (const f of G.fx) f.t += dt; G.fx = G.fx.filter(f => f.t < f.life);
  // проигрыш — ратуша пала
  if (!G.over && !G.buildings.some(b => b.key === 'townhall')) endGame(false);
}
