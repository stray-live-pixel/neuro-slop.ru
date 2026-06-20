// Генерация стартовой карты: ратуша, крестьяне, ресурсы.
import { G } from '../core/state';
import { g2s, inBounds } from '../core/iso';
import { MAP } from '../data/config';
import { makeGrid } from '../core/grid';
import { placeBuilding, spawnUnit, addNode, recalcPop } from './entities';
import { gatherOrder, nearestNode } from './commands';

function blob(cx: number, cy: number, kind: string, count: number, spread: number) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 12) {
    tries++;
    const x = Math.round(cx + (Math.random() - 0.5) * spread);
    const y = Math.round(cy + (Math.random() - 0.5) * spread);
    if (inBounds(x, y) && !G.solid[y][x]) { addNode(kind, x, y); placed++; }
  }
}

export function centerOn(gx: number, gy: number) {
  const s = g2s(gx, gy);
  G.cam.x += window.innerWidth / 2 - s.x;
  G.cam.y += window.innerHeight / 2 - s.y;
}

export function genMap() {
  makeGrid();
  const mx = (MAP.W / 2) | 0, my = (MAP.H / 2) | 0;
  placeBuilding('townhall', mx - 1, my - 1, true);
  const starters = [];
  for (let i = 0; i < 5; i++) starters.push(spawnUnit('peasant', mx + (i - 2), my + 2, 'player'));
  blob(mx - 7, my - 6, 'forest', 26, 7);
  blob(mx + 8, my - 7, 'forest', 22, 6);
  blob(mx + 9, my + 6, 'forest', 20, 6);
  blob(mx - 8, my + 7, 'rocks', 12, 4);
  blob(mx + 7, my + 8, 'rocks', 10, 4);
  blob(mx - 9, my + 1, 'goldore', 8, 3);
  blob(mx + 9, my - 1, 'goldore', 8, 3);
  blob(mx - 3, my - 6, 'berries', 9, 3);
  blob(mx + 4, my + 6, 'berries', 9, 3);
  blob(4, 4, 'forest', 16, 5); blob(MAP.W - 5, MAP.H - 5, 'forest', 16, 5);
  blob(MAP.W - 6, 6, 'rocks', 10, 4); blob(6, MAP.H - 6, 'goldore', 8, 3);
  recalcPop();
  // авто-задание стартовым крестьянам: показать, как идёт добыча
  starters.forEach((u, i) => { const kind = i < 3 ? 'forest' : 'berries'; const n = nearestNode(u, kind) || nearestNode(u); if (n) gatherOrder(u, n); });
  centerOn(mx, my);
}
