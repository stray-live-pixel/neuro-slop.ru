// Мобильные контролы: нижние кнопки быстрого выбора и классы тела для подсказок.
import { G } from '../core/state';
import { IS_TOUCH } from './device';
import { centerOn } from '../sim/map';
import { selectAllArmy, selectIdlePeasant } from './selection';
import { togglePause } from './keyboard';

function centerTownhall() {
  const th = G.buildings.find(b => b.key === 'townhall');
  if (th) centerOn(th.cx, th.cy);
}

export function initMobile() {
  document.body.classList.toggle('touch', IS_TOUCH);
  document.body.classList.toggle('desktop', !IS_TOUCH);
  const bar = document.getElementById('mobilebar');
  if (IS_TOUCH && bar) bar.classList.remove('hidden');
  bar?.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button'); if (!btn) return;
    const act = (btn as HTMLElement).dataset.act;
    if (act === 'army') selectAllArmy();
    else if (act === 'idle') selectIdlePeasant();
    else if (act === 'center') centerTownhall();
    else if (act === 'pause') togglePause();
  });
}
