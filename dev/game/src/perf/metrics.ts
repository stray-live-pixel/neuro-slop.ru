// Оверлей метрик производительности (F3 / кнопка в HUD).
import { G } from '../core/state';
import { R } from '../render/context';
import { getCullStats } from '../render/scene';

const N = 90;                       // окно усреднения (~1.5 с при 60fps)
const frame: number[] = [];
const sim: number[] = [];
const render: number[] = [];
let shown = false;
let lastPaint = 0;

function push(arr: number[], v: number) { arr.push(v); if (arr.length > N) arr.shift(); }
const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const max = (a: number[]) => (a.length ? Math.max(...a) : 0);

export function perfSample(frameMs: number, simMs: number, renderMs: number) {
  push(frame, frameMs); push(sim, simMs); push(render, renderMs);
  if (!shown) return;
  // перерисовываем оверлей не чаще ~4 раз/сек
  if (G.time - lastPaint < 0.25) return;
  lastPaint = G.time;
  paint();
}

function paint() {
  const el = document.getElementById('perf'); if (!el) return;
  const fAvg = avg(frame), fMax = max(frame);
  const fps = fAvg > 0 ? 1000 / fAvg : 0;
  const fpsMin = fMax > 0 ? 1000 / fMax : 0;
  const cull = getCullStats();
  const enemies = G.units.reduce((s, u) => s + (u.side === 'enemy' ? 1 : 0), 0);
  const fpsCls = fps >= 58 ? 'good' : fps >= 45 ? 'mid' : 'bad';
  el.innerHTML =
    `<div class="prow"><b class="${fpsCls}">${fps.toFixed(0)} fps</b><span>мин ${fpsMin.toFixed(0)}</span></div>` +
    `<div class="prow"><span>кадр</span><b>${fAvg.toFixed(1)}</b><span>макс ${fMax.toFixed(1)} мс</span></div>` +
    `<div class="prow"><span>симуляция</span><b>${avg(sim).toFixed(2)} мс</b></div>` +
    `<div class="prow"><span>рендер</span><b>${avg(render).toFixed(2)} мс</b></div>` +
    `<div class="prow"><span>объекты</span><b>${cull.visible}/${cull.total}</b><span>в кадре</span></div>` +
    `<div class="prow"><span>юниты</span><b>${G.units.length}</b><span>враг ${enemies}</span></div>` +
    `<div class="prow"><span>здания</span><b>${G.buildings.length}</b><span>частиц ${G.particles.length}</span></div>` +
    `<div class="prow"><span>экран</span><b>${window.innerWidth}×${window.innerHeight}</b><span>×${R.app?.renderer.resolution ?? 1}</span></div>`;
}

export function togglePerf(force?: boolean) {
  shown = force !== undefined ? force : !shown;
  const el = document.getElementById('perf');
  if (el) el.classList.toggle('hidden', !shown);
  if (shown) paint();
}
export const perfShown = () => shown;
