// Поповер настроек графики: сглаживание и предел частоты кадров.
import { settings, setSmoothing, cycleFps, fpsLabel } from '../core/settings';
import { resizeRenderer } from '../render/context';
import { sfx } from '../audio/sfx';

const el = (id: string) => document.getElementById(id)!;

export function initSettings() {
  const panel = el('settings');
  const btn = el('settingsBtn');
  const smooth = el('setSmooth');
  const fps = el('setFps');

  const sync = () => {
    smooth.textContent = settings.smoothing ? 'Вкл' : 'Выкл';
    smooth.classList.toggle('on', settings.smoothing);
    fps.textContent = fpsLabel();
  };

  btn.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('hidden'); sync(); });
  smooth.addEventListener('click', () => { setSmoothing(!settings.smoothing); resizeRenderer(); sfx('click'); sync(); });
  fps.addEventListener('click', () => { cycleFps(); sfx('click'); sync(); });

  // клик/тап вне поповера — закрыть
  document.addEventListener('pointerdown', e => {
    if (panel.classList.contains('hidden')) return;
    const t = e.target as Node;
    if (!panel.contains(t) && t !== btn && !btn.contains(t)) panel.classList.add('hidden');
  });

  sync();
}
