// Мини-карта: обзор всей карты, объекты, рамка вьюпорта и предупреждение о
// стороне захода волны. Клик/перетаскивание — переместить камеру.
import { G } from '../core/state';
import { MAP } from '../data/config';
import { s2g, clamp } from '../core/iso';
import { centerOn } from '../sim/map';

let cv: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let SZ = 168;

export function initMinimap() {
  cv = document.getElementById('minimap') as HTMLCanvasElement | null;
  if (!cv) return;
  SZ = cv.width;
  ctx = cv.getContext('2d');

  const toGrid = (clientX: number, clientY: number) => {
    const r = cv!.getBoundingClientRect();
    return {
      x: clamp((clientX - r.left) / r.width * MAP.W, 0, MAP.W - 1),
      y: clamp((clientY - r.top) / r.height * MAP.H, 0, MAP.H - 1),
    };
  };
  let dragging = false;
  const jump = (e: PointerEvent) => { const g = toGrid(e.clientX, e.clientY); centerOn(g.x, g.y); };
  cv.addEventListener('pointerdown', e => { dragging = true; jump(e); e.preventDefault(); });
  window.addEventListener('pointermove', e => { if (dragging) jump(e); });
  window.addEventListener('pointerup', () => { dragging = false; });
}

const SIDE = ['top', 'right', 'bottom', 'left'];

export function drawMinimap() {
  if (!ctx) return;
  const s = SZ / MAP.W;
  ctx.clearRect(0, 0, SZ, SZ);
  ctx.fillStyle = '#aebf85'; ctx.fillRect(0, 0, SZ, SZ);

  // ресурсные узлы
  for (const n of G.nodes) {
    ctx.fillStyle = n.res === 'wood' ? '#5d7b3f' : n.res === 'gold' ? '#c8a33b' : n.res === 'stone' ? '#8b8d91' : '#b9596b';
    ctx.fillRect(n.gx * s, n.gy * s, Math.max(1, s), Math.max(1, s));
  }
  // здания (стены — серые, прочие — синие)
  for (const b of G.buildings) {
    ctx.fillStyle = b.key === 'wall' ? '#9b8f78' : '#3a72d6';
    ctx.fillRect(b.ox * s, b.oy * s, Math.max(2, b.size * s), Math.max(2, b.size * s));
  }
  // юниты
  for (const u of G.units) {
    ctx.fillStyle = u.side === 'enemy' ? '#e2433a' : u.type === 'peasant' ? '#dcc869' : '#5fcf6f';
    const r = Math.max(1.6, s * 0.8);
    ctx.fillRect(u.gx * s - r / 2, u.gy * s - r / 2, r, r);
  }

  // предупреждение о стороне следующей волны (в подготовке)
  if (G.wave.state === 'prep') {
    const a = 0.35 + 0.55 * Math.abs(Math.sin(G.time * 3));
    ctx.fillStyle = `rgba(231,72,60,${a})`;
    const len = SZ * 0.5, th = 5, mid = SZ / 2;
    const side = SIDE[G.wave.side] || 'top';
    if (side === 'top') ctx.fillRect(mid - len / 2, 0, len, th);
    else if (side === 'right') ctx.fillRect(SZ - th, mid - len / 2, th, len);
    else if (side === 'bottom') ctx.fillRect(mid - len / 2, SZ - th, len, th);
    else ctx.fillRect(0, mid - len / 2, th, len);
  }

  // рамка вьюпорта камеры (4 угла экрана → сетка)
  const W = window.innerWidth, H = window.innerHeight;
  const corners = [s2g(0, 0), s2g(W, 0), s2g(W, H), s2g(0, H)];
  ctx.beginPath();
  corners.forEach((p, i) => { const x = p.x * s, y = p.y * s; i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y); });
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
}
