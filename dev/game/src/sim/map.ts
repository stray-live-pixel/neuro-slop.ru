// Генерация стартовой карты: процедурный ландшафт, ратуша, крестьяне, ресурсы.
import { G } from '../core/state';
import { g2s, inBounds } from '../core/iso';
import { TERRAIN } from '../core/grid';
import { MAP } from '../data/config';
import { makeGrid } from '../core/grid';
import { rng, pick } from '../core/rng';
import { placeBuilding, spawnUnit, addNode, recalcPop } from './entities';
import { gatherOrder, nearestNode } from './commands';

const WATER_REEDS = ['water-reeds-1', 'water-reeds-2', 'water-reeds-3'];
const WATER_LILIES = ['water-lilies-1', 'water-lilies-2', 'water-lilies-3'];
const SHORE_STONES = ['shore-stones-1', 'shore-stones-2', 'shore-stones-3', 'shore-stones-4'];
const LAND_DECOR = ['bush', 'bush', 'bush', 'flowers', 'flowers', 'flowers', 'flowers', 'stump', 'log', 'haystack'];

function riverCx(y: number): number {
  return Math.round(MAP.W * 0.31 + Math.sin(y * 0.18) * 4.2 + Math.sin(y * 0.065 + 1.7) * 3.1);
}

function riverR(y: number): number {
  return 2 + (Math.sin(y * 0.31 + 0.4) > 0.45 ? 1 : 0);
}

function setTerrain(x: number, y: number, t: number) {
  if (inBounds(x, y)) G.terrain[y][x] = t;
}

function clampTile(v: number, max: number): number {
  return Math.max(1, Math.min(max - 2, Math.round(v)));
}

function landFree(x: number, y: number): boolean {
  return inBounds(x, y) && G.terrain[y][x] === TERRAIN.LAND && !G.solid[y][x];
}

function nearStart(x: number, y: number, mx: number, my: number, r: number): boolean {
  return Math.hypot(x - mx, y - my) <= r;
}

function addBridge(cx: number, cy: number, halfLen: number) {
  const x0 = Math.max(1, Math.round(cx - halfLen));
  const x1 = Math.min(MAP.W - 2, Math.round(cx + halfLen));
  const y0 = Math.max(1, Math.round(cy));
  const y1 = Math.min(MAP.H - 2, Math.round(cy));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setTerrain(x, y, TERRAIN.BRIDGE);
}

function carvePond(cx: number, cy: number, rx: number, ry: number, mx: number, my: number) {
  const fordTilt = rng() < 0.5 ? -0.42 : 0.42;
  const fordWidth = 0.16 + rng() * 0.08;
  for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
    if (!inBounds(x, y) || nearStart(x, y, mx, my, 12)) continue;
    const nx = (x - cx) / rx, ny = (y - cy) / ry;
    const wobble = (rng() - 0.5) * 0.22;
    const d = nx * nx + ny * ny + wobble;
    if (d < 1) {
      const ford = Math.abs(ny - nx * fordTilt) < fordWidth;
      const edge = d > 0.7 || rng() < 0.04;
      setTerrain(x, y, ford || edge ? TERRAIN.SHALLOW : TERRAIN.WATER);
    }
  }

  // У каждого озера есть естественная мелководная переправа, но без деревянного моста.
  const steps = Math.ceil(rx * 2.5);
  for (let i = -steps; i <= steps; i++) {
    const k = i / Math.max(1, steps);
    const x = Math.round(cx + k * rx * 0.92);
    const y = Math.round(cy + k * rx * fordTilt);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const tx = x + ox, ty = y + oy;
      if (Math.abs(ox) + Math.abs(oy) > 1 && rng() < 0.55) continue;
      if (inBounds(tx, ty) && !nearStart(tx, ty, mx, my, 12)) setTerrain(tx, ty, TERRAIN.SHALLOW);
    }
  }
}

function generateTerrain(mx: number, my: number) {
  // Главная река идёт с севера на юг и делит карту; переходы только по мостам.
  for (let y = 2; y < MAP.H - 2; y++) {
    const cx = riverCx(y), r = riverR(y);
    for (let x = cx - r; x <= cx + r; x++) if (!nearStart(x, y, mx, my, 10)) setTerrain(x, y, TERRAIN.WATER);
  }

  // Мосты — процедурные переходы через реку. Озёра мостов не получают.
  const bridgeCount = Math.max(4, Math.round(MAP.H / 23));
  const margin = Math.max(11, Math.round(MAP.H * 0.12));
  const minGap = Math.max(8, Math.round(MAP.H / (bridgeCount + 2)));
  const bridgeRows: number[] = [];
  for (let i = 0; i < bridgeCount; i++) {
    let y = clampTile(margin + i * ((MAP.H - margin * 2) / Math.max(1, bridgeCount - 1)) + (rng() - 0.5) * minGap, MAP.H);
    if (nearStart(riverCx(y), y, mx, my, 13)) y = clampTile(y + (y < my ? -minGap : minGap), MAP.H);
    if (bridgeRows.some(v => Math.abs(v - y) < minGap)) y = clampTile(y + minGap * 0.7, MAP.H);
    bridgeRows.push(y);
    addBridge(riverCx(y), y, riverR(y) + 3 + (rng() < 0.35 ? 1 : 0));
  }

  // Несколько прудов каждый сид получают чуть иную форму и мостик.
  const ponds = [
    { cx: MAP.W * 0.67 + (rng() - 0.5) * 7, cy: MAP.H * 0.22 + (rng() - 0.5) * 5, rx: 5 + rng() * 2.5, ry: 3.5 + rng() * 1.8 },
    { cx: MAP.W * 0.78 + (rng() - 0.5) * 6, cy: MAP.H * 0.68 + (rng() - 0.5) * 7, rx: 6 + rng() * 2.5, ry: 4 + rng() * 2 },
    { cx: MAP.W * 0.17 + (rng() - 0.5) * 5, cy: MAP.H * 0.78 + (rng() - 0.5) * 6, rx: 4.8 + rng() * 2, ry: 3.8 + rng() * 1.6 },
  ];
  ponds.forEach(p => carvePond(p.cx, p.cy, p.rx, p.ry, mx, my));

  // Гарантированная сухая стартовая зона под ратушу и первых крестьян.
  for (let y = my - 8; y <= my + 8; y++) for (let x = mx - 8; x <= mx + 8; x++) {
    if (inBounds(x, y) && Math.hypot(x - mx, y - my) <= 8) setTerrain(x, y, TERRAIN.LAND);
  }
}

function blob(cx: number, cy: number, kind: string, count: number, spread: number) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 22) {
    tries++;
    const x = Math.round(cx + (rng() - 0.5) * spread);
    const y = Math.round(cy + (rng() - 0.5) * spread);
    if (landFree(x, y)) { addNode(kind, x, y); placed++; }
  }
}

function scatterResourceClusters(mx: number, my: number) {
  // Ближние ресурсы — читаемые стартовые точки вокруг базы.
  blob(mx - 7, my - 6, 'forest', 32, 8);
  blob(mx + 9, my - 7, 'forest', 28, 7);
  blob(mx + 10, my + 7, 'forest', 26, 7);
  blob(mx - 8, my + 7, 'rocks', 13, 5);
  blob(mx + 8, my + 9, 'rocks', 12, 5);
  blob(mx - 9, my + 1, 'goldore', 9, 4);
  blob(mx + 10, my - 1, 'goldore', 9, 4);
  blob(mx - 3, my - 7, 'berries', 10, 4);
  blob(mx + 5, my + 6, 'berries', 10, 4);

  // Дальние процедурные кластеры дают смысл большой карте и мостам.
  for (let i = 0; i < 22; i++) {
    const x = 5 + rng() * (MAP.W - 10);
    const y = 5 + rng() * (MAP.H - 10);
    if (nearStart(x, y, mx, my, 15)) continue;
    const roll = rng();
    if (roll < 0.48) blob(x, y, 'forest', 18 + ((rng() * 12) | 0), 7 + rng() * 4);
    else if (roll < 0.68) blob(x, y, 'rocks', 7 + ((rng() * 7) | 0), 4 + rng() * 3);
    else if (roll < 0.84) blob(x, y, 'goldore', 6 + ((rng() * 6) | 0), 3 + rng() * 3);
    else blob(x, y, 'berries', 7 + ((rng() * 6) | 0), 3 + rng() * 3);
  }
}

function hasNeighborTerrain(x: number, y: number, t: number): boolean {
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
    if (!ox && !oy) continue;
    const nx = x + ox, ny = y + oy;
    if (inBounds(nx, ny) && G.terrain[ny][nx] === t) return true;
  }
  return false;
}

function isWaterSurface(t: number): boolean {
  return t === TERRAIN.WATER || t === TERRAIN.SHALLOW || t === TERRAIN.BRIDGE;
}

function hasNeighborWaterSurface(x: number, y: number): boolean {
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
    if (!ox && !oy) continue;
    const nx = x + ox, ny = y + oy;
    if (inBounds(nx, ny) && isWaterSurface(G.terrain[ny][nx])) return true;
  }
  return false;
}

function scatterDecor(mx: number, my: number) {
  for (let i = 0; i < 340; i++) {
    const x = 1 + ((rng() * (MAP.W - 2)) | 0), y = 1 + ((rng() * (MAP.H - 2)) | 0);
    if (!landFree(x, y)) continue;
    if (nearStart(x, y, mx, my, 4)) continue;
    G.decor.push({ img: pick(LAND_DECOR), gx: x + (rng() - 0.5) * 0.5, gy: y + (rng() - 0.5) * 0.5 });
  }

  for (let y = 1; y < MAP.H - 1; y++) for (let x = 1; x < MAP.W - 1; x++) {
    const t = G.terrain[y][x];
    if ((t === TERRAIN.WATER || t === TERRAIN.SHALLOW) && rng() < (t === TERRAIN.SHALLOW ? 0.018 : 0.035)) {
      G.decor.push({ img: pick(WATER_LILIES), gx: x + (rng() - 0.5) * 0.38, gy: y + (rng() - 0.5) * 0.38 });
    } else if (t === TERRAIN.LAND && !G.solid[y][x] && hasNeighborWaterSurface(x, y) && rng() < 0.26) {
      G.decor.push({
        img: rng() < 0.62 ? pick(WATER_REEDS) : pick(SHORE_STONES),
        gx: x + (rng() - 0.5) * 0.55,
        gy: y + (rng() - 0.5) * 0.55,
      });
    }
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
  generateTerrain(mx, my);
  placeBuilding('townhall', mx - 1, my - 1, true);
  const starters = [];
  for (let i = 0; i < 5; i++) starters.push(spawnUnit('peasant', mx + (i - 2), my + 2, 'player'));
  scatterResourceClusters(mx, my);
  recalcPop();
  scatterDecor(mx, my);
  // авто-задание стартовым крестьянам: показать, как идёт добыча
  starters.forEach((u, i) => { const kind = i < 3 ? 'forest' : 'berries'; const n = nearestNode(u, kind) || nearestNode(u); if (n) gatherOrder(u, n); });
  centerOn(mx, my);
}
