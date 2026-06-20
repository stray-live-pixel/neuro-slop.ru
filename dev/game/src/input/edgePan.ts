// Чистая логика edge-scroll камеры: на сколько сдвинуть камеру, когда курсор у края экрана.
// Вынесена из cameraKeys, чтобы покрыть тестами: edge-scroll НЕ должен срабатывать,
// когда курсор над UI-панелью (баг — карта ехала при наведении на кнопки HUD), идёт
// drag-пан средней кнопкой, это тач-устройство или мышь ещё ни разу не двигалась.

export interface EdgePanInput {
  x: number;          // позиция курсора по X в координатах вьюпорта (clientX), не относительно UI-элемента
  y: number;          // позиция курсора по Y в координатах вьюпорта (clientY)
  active: boolean;    // курсор уже двигался по странице (иначе 0,0 ложно считалось бы краем)
  overUI: boolean;    // курсор над панелью HUD, а не над игровым канвасом — edge-scroll выключаем
  panning: boolean;   // зажата средняя кнопка (drag-пан) — край не трогаем
  touch: boolean;     // тач-устройство — edge-scroll выключен полностью (камера двигается пальцем)
  vw: number;         // ширина вьюпорта
  vh: number;         // высота вьюпорта
  zoom: number;       // текущий зум камеры (скорость скейлится обратно)
  dt: number;         // дельта времени кадра, сек
  margin?: number;    // ширина чувствительной зоны у края, px (по умолчанию 22)
  speed?: number;     // базовая скорость скролла px/сек (по умолчанию 520)
}

export function edgePan(i: EdgePanInput): { dx: number; dy: number } {
  if (i.touch || !i.active || i.panning || i.overUI) return { dx: 0, dy: 0 };
  const m = i.margin ?? 22;
  const es = (i.speed ?? 520) * i.dt / i.zoom;
  let dx = 0, dy = 0;
  if (i.x < m) dx += es; else if (i.x > i.vw - m) dx -= es;
  if (i.y < m) dy += es; else if (i.y > i.vh - m) dy -= es;
  return { dx, dy };
}
