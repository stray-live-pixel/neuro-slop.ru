// Графические настройки игрока: сглаживание (anti-alias + плотность экрана) и
// предел частоты кадров (vsync). Хранятся в localStorage, применяются к
// рендереру (см. render/context) и к главному циклу (см. main).

export interface Settings {
  smoothing: boolean;   // рендер в плотности экрана (Retina/4K) + MSAA — чёткие сглаженные края
  fpsCap: number;       // максимум кадров/с; 0 — без ограничения (vsync экрана)
}

const KEY = 'gardarika.gfx';
// порядок переключения кнопкой «Кадров/с»: дефолт → выше → ниже → без предела
const FPS_OPTIONS = [60, 120, 30, 0];

function load(): Settings {
  const def: Settings = { smoothing: true, fpsCap: 60 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw) as Partial<Settings>;
      if (typeof o.smoothing === 'boolean') def.smoothing = o.smoothing;
      if (typeof o.fpsCap === 'number' && FPS_OPTIONS.includes(o.fpsCap)) def.fpsCap = o.fpsCap;
    }
  } catch { /* приватный режим / запрет хранилища — остаются дефолты */ }
  return def;
}

export const settings: Settings = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* игнор */ }
}

// Целевая плотность рендера: при сглаживании — плотность экрана с потолком ×2
// (на 4K/Retina не множим пиксели сверх разумного), иначе ровно 1.
export function renderResolution(): number {
  return settings.smoothing ? Math.min(window.devicePixelRatio || 1, 2) : 1;
}

export function setSmoothing(on: boolean) { settings.smoothing = on; save(); }

export function cycleFps() {
  const i = FPS_OPTIONS.indexOf(settings.fpsCap);
  settings.fpsCap = FPS_OPTIONS[(i + 1) % FPS_OPTIONS.length];
  save();
}

export const fpsLabel = () => (settings.fpsCap === 0 ? '∞' : String(settings.fpsCap));
