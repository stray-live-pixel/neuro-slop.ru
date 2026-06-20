// Клавиатура: камера (WASD/стрелки), пауза, метрики, снос здания, хоткеи.
import { G, keys, mouse } from '../core/state';
import { deselect, selectAllArmy } from './selection';
import { refund } from '../sim/economy';
import { removeBuilding } from '../sim/entities';
import { centerOn } from '../sim/map';
import { renderPanel } from '../ui/panel';
import { toast } from '../ui/toast';
import { sfx } from '../audio/sfx';
import { togglePerf } from '../perf/metrics';
import { IS_TOUCH } from './device';
import { edgePan } from './edgePan';
import type { Building, Unit } from '../core/types';

export function togglePause(force?: boolean) {
  G.paused = force !== undefined ? force : !G.paused;
  document.getElementById('pauseTag')!.classList.toggle('hidden', !G.paused);
}

// ---- контрол-группы: Shift+1..4 назначить, 1..4 выбрать, двойное нажатие — к группе ----
function assignGroup(n: number) {
  const ids = G.selection.filter((s): s is Unit => s.kind === 'unit' && s.side === 'player').map(u => u.id);
  if (!ids.length) return;
  G.groups[n] = ids; toast('Группа ' + n + ': ' + ids.length + ' юн.'); sfx('click');
}
let lastG = 0, lastGT = 0;
function selectGroup(n: number) {
  const ids = G.groups[n]; if (!ids || !ids.length) return;
  const live = G.units.filter(u => u.side === 'player' && ids.includes(u.id));
  if (!live.length) return;
  G.selection = live; renderPanel(); sfx('select');
  const now = performance.now();
  if (lastG === n && now - lastGT < 380) {                 // двойное нажатие — камера к группе
    const cx = live.reduce((s, u) => s + u.gx, 0) / live.length;
    const cy = live.reduce((s, u) => s + u.gy, 0) / live.length;
    centerOn(cx, cy);
  }
  lastG = n; lastGT = now;
}

export function initKeyboard() {
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') { G.place = null; deselect(); }
    if (e.key === ' ') { togglePause(); e.preventDefault(); }
    if (e.key === 'F3') { togglePerf(); e.preventDefault(); }
    if (e.key.toLowerCase() === 'a' && e.ctrlKey) { selectAllArmy(); e.preventDefault(); }
    const dg = e.code.match(/^Digit([1-4])$/);
    if (dg) { e.shiftKey ? assignGroup(+dg[1]) : selectGroup(+dg[1]); e.preventDefault(); }
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
  // edge-scroll — только мышь на десктопе и только когда курсор над картой, не над UI
  const ep = edgePan({
    x: mouse.x, y: mouse.y, active: mouse.active, overUI: mouse.overUI,
    panning: !!mouse.pan, touch: IS_TOUCH,
    vw: window.innerWidth, vh: window.innerHeight, zoom: G.cam.zoom, dt,
  });
  G.cam.x += ep.dx; G.cam.y += ep.dy;
}
