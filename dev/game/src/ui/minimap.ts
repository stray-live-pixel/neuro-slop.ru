// Мини-карта в той же изометрической проекции, что и игра: ориентация карты
// совпадает с видом камеры, рамка вьюпорта — настоящий прямоугольник.
// Клик/перетаскивание — переместить камеру.
import { G } from '../core/state';
import { MAP, TILE } from '../data/config';
import { s2g, clamp } from '../core/iso';
import { TERRAIN } from '../core/grid';
import { centerOn } from '../sim/map';

let cv: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let W = 200, H = 112;

// изометрия карты без камеры (как core/iso.iso, но локально, чтобы не тащить камеру)
const HW = TILE.w / 2, HH = TILE.h / 2;
const isoW = (gx: number, gy: number) => ({ x: (gx - gy) * HW, y: (gx + gy) * HH });

let scale = 1, offX = 0, offY = 0, minWX = 0, minWY = 0;
function fit() {
  const cs = [isoW(0, 0), isoW(MAP.W, 0), isoW(0, MAP.H), isoW(MAP.W, MAP.H)];
  minWX = Math.min(...cs.map(c => c.x)); const maxWX = Math.max(...cs.map(c => c.x));
  minWY = Math.min(...cs.map(c => c.y)); const maxWY = Math.max(...cs.map(c => c.y));
  const pad = 6;
  scale = Math.min((W - 2 * pad) / (maxWX - minWX), (H - 2 * pad) / (maxWY - minWY));
  offX = (W - (maxWX - minWX) * scale) / 2;
  offY = (H - (maxWY - minWY) * scale) / 2;
}
const toMini = (gx: number, gy: number) => { const w = isoW(gx, gy); return { x: (w.x - minWX) * scale + offX, y: (w.y - minWY) * scale + offY }; };
function fromMini(px: number, py: number) {
  const a = ((px - offX) / scale + minWX) / HW, b = ((py - offY) / scale + minWY) / HH;  // обратная изометрия
  return { x: clamp((a + b) / 2, 0, MAP.W - 1), y: clamp((b - a) / 2, 0, MAP.H - 1) };
}

export function initMinimap() {
  cv = document.getElementById('minimap') as HTMLCanvasElement | null;
  if (!cv) return;
  W = cv.width; H = cv.height; ctx = cv.getContext('2d'); fit();

  const toGrid = (clientX: number, clientY: number) => {
    const r = cv!.getBoundingClientRect();
    return fromMini((clientX - r.left) / r.width * W, (clientY - r.top) / r.height * H);
  };
  let dragging = false;
  const jump = (e: PointerEvent) => { const g = toGrid(e.clientX, e.clientY); centerOn(g.x, g.y); };
  cv.addEventListener('pointerdown', e => { dragging = true; jump(e); e.preventDefault(); });
  window.addEventListener('pointermove', e => { if (dragging) jump(e); });
  window.addEventListener('pointerup', () => { dragging = false; });
}

// края карты-ромба для каждой стороны захода орды (индекс = w.side)
const EDGES: [[number, number], [number, number]][] = [
  [[0, 0], [MAP.W, 0]],          // 0 — север (верхний-правый край ромба)
  [[MAP.W, 0], [MAP.W, MAP.H]],  // 1 — восток
  [[MAP.W, MAP.H], [0, MAP.H]],  // 2 — юг
  [[0, MAP.H], [0, 0]],          // 3 — запад
];

export function drawMinimap() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#cdbfa3'; ctx.fillRect(0, 0, W, H);   // бежевый фон по краям (как основной цвет игры)

  // подложка-ромб самой карты
  const dia = [toMini(0, 0), toMini(MAP.W, 0), toMini(MAP.W, MAP.H), toMini(0, MAP.H)];
  ctx.beginPath();
  dia.forEach((p, i) => i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = '#aebf85'; ctx.fill();

  const dot = (gx: number, gy: number, col: string, s: number) => { const p = toMini(gx, gy); ctx!.fillStyle = col; ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s); };
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const t = G.terrain[y]?.[x] ?? TERRAIN.LAND;
    if (t === TERRAIN.WATER) dot(x + 0.5, y + 0.5, '#3f8fa8', 1.6);
    else if (t === TERRAIN.SHALLOW) dot(x + 0.5, y + 0.5, '#81bfb1', 1.55);
    else if (t === TERRAIN.BRIDGE) dot(x + 0.5, y + 0.5, '#9a6d3f', 1.7);
  }
  for (const n of G.nodes) dot(n.gx, n.gy, n.res === 'wood' ? '#5d7b3f' : n.res === 'gold' ? '#c8a33b' : n.res === 'stone' ? '#8b8d91' : '#b9596b', 2);
  for (const b of G.buildings) dot(b.cx, b.cy, b.key === 'wall' ? '#9b8f78' : '#3a72d6', Math.max(3, b.size * 2));
  for (const u of G.units) dot(u.gx, u.gy, u.side === 'enemy' ? '#e2433a' : u.type === 'peasant' ? '#dcc869' : '#5fcf6f', 2.6);

  // предупреждение о стороне следующей волны — по краю ромба
  if (G.wave.state === 'prep') {
    const e = EDGES[G.wave.side] || EDGES[0];
    const a = toMini(e[0][0], e[0][1]), b = toMini(e[1][0], e[1][1]);
    ctx.strokeStyle = `rgba(231,72,60,${0.35 + 0.55 * Math.abs(Math.sin(G.time * 3))})`;
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  // рамка вьюпорта камеры (углы экрана → сетка → мини-карта = прямоугольник)
  const Wp = window.innerWidth, Hp = window.innerHeight;
  const view = [s2g(0, 0), s2g(Wp, 0), s2g(Wp, Hp), s2g(0, Hp)].map(g => toMini(g.x, g.y));
  ctx.beginPath();
  view.forEach((p, i) => i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
}
