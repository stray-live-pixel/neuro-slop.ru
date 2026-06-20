// Единый ввод указателя: мышь (десктоп) и тач (мобилки) на Pointer Events.
import { G, mouse } from '../core/state';
import { s2g, g2s, clamp } from '../core/iso';
import { pickTile } from '../core/grid';
import { commandSelection } from '../sim/commands';
import { tryPlace } from '../sim/placement';
import { ensureAudio } from '../audio/sfx';
import { pickUnit, selectOne, deselect, boxSelect } from './selection';
import type { Selectable } from '../core/types';

const canvas = () => document.getElementById('game') as HTMLCanvasElement;

function zoomAt(sx: number, sy: number, factor: number) {
  const before = s2g(sx, sy);
  G.cam.zoom = clamp(G.cam.zoom * factor, 0.5, 2.4);
  const after = g2s(before.x, before.y);
  G.cam.x += sx - after.x; G.cam.y += sy - after.y;
}

function setWorldCursor(sx: number, sy: number) {
  mouse.x = sx; mouse.y = sy;
  const w = s2g(sx, sy); mouse.gx = w.x; mouse.gy = w.y;
}

/* ------------------------------ десктоп: мышь ----------------------------- */
function mouseDown(e: PointerEvent) {
  if (G.over) return;
  ensureAudio();
  const sx = e.offsetX, sy = e.offsetY; const w = s2g(sx, sy);
  if (e.button === 2) { if (G.place) { G.place = null; return; } commandSelection(w.x, w.y); return; }
  if (e.button === 1) { mouse.pan = { x: sx, y: sy, cx: G.cam.x, cy: G.cam.y }; return; }
  if (e.button !== 0) return;
  if (G.place) { tryPlace(); return; }
  mouse.down = true; mouse.dragStart = { x: sx, y: sy }; mouse.moved = false;
}
function mouseMove(e: PointerEvent) {
  setWorldCursor(e.offsetX, e.offsetY); mouse.active = true;
  if (mouse.pan) { G.cam.x = mouse.pan.cx + (mouse.x - mouse.pan.x); G.cam.y = mouse.pan.cy + (mouse.y - mouse.pan.y); }
  if (mouse.down && mouse.dragStart) {
    const dx = mouse.x - mouse.dragStart.x, dy = mouse.y - mouse.dragStart.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      mouse.moved = true;
      mouse.dragRect = { x: Math.min(mouse.x, mouse.dragStart.x), y: Math.min(mouse.y, mouse.dragStart.y), w: Math.abs(dx), h: Math.abs(dy) };
    }
  }
}
function mouseUp(e: PointerEvent) {
  if (e.button === 1) { mouse.pan = null; return; }
  if (e.button !== 0 || !mouse.down) return;
  mouse.down = false;
  if (mouse.moved && mouse.dragRect) boxSelect(mouse.dragRect, e.shiftKey);
  else {
    const u = pickUnit(mouse.x, mouse.y);
    if (u) {
      if (e.shiftKey) { const i = G.selection.indexOf(u); i >= 0 ? G.selection.splice(i, 1) : G.selection.push(u); }
      else selectOne(u);
    } else { const t = pickTile(mouse.gx, mouse.gy); selectOne(t && (t.kind === 'building' || t.kind === 'node') ? t : null); }
  }
  mouse.dragRect = null; mouse.dragStart = null;
}

/* ------------------------------ мобилки: тач ------------------------------ */
interface Pt { x: number; y: number; }
const touches = new Map<number, Pt>();
let panLast: Pt | null = null;
let pinchPrev: { dist: number; mx: number; my: number } | null = null;
let tapStart: { x: number; y: number; t: number } | null = null;
let tapMoved = false;

function touchTap(sx: number, sy: number) {
  setWorldCursor(sx, sy);
  const w = s2g(sx, sy);
  if (G.place) { tryPlace(); return; }
  const u = pickUnit(sx, sy);
  const tile = pickTile(w.x, w.y);
  const players = G.selection.filter(s => s.kind === 'unit' && (s as any).side === 'player');
  if (players.length) {
    // приказ: враг / ресурс / недостроенное здание / пустая земля
    if (u && u.side === 'enemy') { commandSelection(w.x, w.y); return; }
    if (tile && tile.kind === 'node') { commandSelection(w.x, w.y); return; }
    if (tile && tile.kind === 'building' && tile.progress < 1) { commandSelection(w.x, w.y); return; }
    if (!u && !tile) { commandSelection(w.x, w.y); return; }   // пустая земля — идти
  }
  if (u) { selectOne(u); return; }
  selectOne(tile && (tile.kind === 'building' || tile.kind === 'node') ? tile as Selectable : null);
}

function touchDown(e: PointerEvent) {
  if (G.over) return;
  ensureAudio();
  touches.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  setWorldCursor(e.offsetX, e.offsetY);
  if (touches.size === 1) {
    panLast = { x: e.offsetX, y: e.offsetY };
    tapStart = { x: e.offsetX, y: e.offsetY, t: performance.now() };
    tapMoved = false; pinchPrev = null;
  } else if (touches.size === 2) {
    pinchPrev = null; tapMoved = true; // два пальца — это жест, не тап
  }
}
function touchMove(e: PointerEvent) {
  const p = touches.get(e.pointerId); if (!p) return;
  p.x = e.offsetX; p.y = e.offsetY;
  if (touches.size >= 2) {
    const it = [...touches.values()]; const a = it[0], b = it[1];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinchPrev) {
      if (pinchPrev.dist > 0) zoomAt(mx, my, dist / pinchPrev.dist);
      G.cam.x += mx - pinchPrev.mx; G.cam.y += my - pinchPrev.my;
    }
    pinchPrev = { dist, mx, my };
    return;
  }
  // один палец
  if (G.place) { setWorldCursor(e.offsetX, e.offsetY); return; } // призрак следует за пальцем
  if (tapStart && Math.hypot(e.offsetX - tapStart.x, e.offsetY - tapStart.y) > 12) tapMoved = true;
  if (panLast) { G.cam.x += e.offsetX - panLast.x; G.cam.y += e.offsetY - panLast.y; }
  panLast = { x: e.offsetX, y: e.offsetY };
}
function touchUp(e: PointerEvent) {
  const had = touches.size;
  const last = touches.get(e.pointerId);
  touches.delete(e.pointerId);
  if (had === 1 && last && tapStart && !tapMoved && performance.now() - tapStart.t < 450) {
    touchTap(last.x, last.y);
  }
  if (touches.size === 1) { const r = [...touches.values()][0]; panLast = { x: r.x, y: r.y }; pinchPrev = null; }
  else if (touches.size === 0) { panLast = null; pinchPrev = null; tapStart = null; }
}

/* ------------------------------ подключение ------------------------------- */
export function initPointer() {
  const c = canvas();
  c.style.touchAction = 'none';
  c.addEventListener('contextmenu', e => e.preventDefault());

  c.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') touchDown(e);
    else mouseDown(e);
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') touchMove(e);
    else mouseMove(e);
  });
  window.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') touchUp(e);
    else mouseUp(e);
  });
  window.addEventListener('pointercancel', e => { if (e.pointerType === 'touch') touchUp(e); });

  c.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(mouse.x, mouse.y, e.deltaY < 0 ? 1.12 : 0.89);
  }, { passive: false });
}
