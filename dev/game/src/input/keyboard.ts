// Клавиатура: камера (WASD/стрелки), пауза, метрики, снос здания, хоткеи.
import { G, keys, mouse } from '../core/state';
import { deselect, selectAllArmy } from './selection';
import { refund } from '../sim/economy';
import { removeBuilding } from '../sim/entities';
import { togglePerf } from '../perf/metrics';
import { IS_TOUCH } from './device';
import type { Building } from '../core/types';

export function togglePause(force?: boolean) {
  G.paused = force !== undefined ? force : !G.paused;
  document.getElementById('pauseTag')!.classList.toggle('hidden', !G.paused);
}

export function initKeyboard() {
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') { G.place = null; deselect(); }
    if (e.key === ' ') { togglePause(); e.preventDefault(); }
    if (e.key === 'F3') { togglePerf(); e.preventDefault(); }
    if (e.key.toLowerCase() === 'a' && e.ctrlKey) { selectAllArmy(); e.preventDefault(); }
    if (e.key === 'Delete' && G.selection.length) {
      const b = G.selection[0];
      if (b.kind === 'building' && b.key !== 'townhall') { refund(b.def.cost, 0.4 * b.progress); removeBuilding(b as Building); }
    }
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
}

export function cameraKeys(dt: number) {
  const sp = 620 * dt / G.cam.zoom;
  if (keys['w'] || keys['arrowup']) G.cam.y += sp;
  if (keys['s'] || keys['arrowdown']) G.cam.y -= sp;
  if (keys['a'] || keys['arrowleft']) G.cam.x += sp;
  if (keys['d'] || keys['arrowright']) G.cam.x -= sp;
  // edge-scroll — только мышь на десктопе
  if (!IS_TOUCH && mouse.active && !mouse.pan) {
    const m = 22, es = 520 * dt / G.cam.zoom;
    if (mouse.x < m) G.cam.x += es; else if (mouse.x > window.innerWidth - m) G.cam.x -= es;
    if (mouse.y < m) G.cam.y += es; else if (mouse.y > window.innerHeight - m) G.cam.y -= es;
  }
}
