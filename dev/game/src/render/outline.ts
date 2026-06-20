// Силуэтный контур по PNG-ассету: восемь смещённых копий спрайта, затонированных
// в цвет контура, рисуются позади оригинала — наружу торчат только края, образуя
// ровную обводку по альфе картинки. Дёшево: активен лишь у наведённых/выделенных.
import { Container, Sprite } from 'pixi.js';

// единичные направления (диагонали ≈0.707, чтобы радиус контура был одинаков по кругу)
const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [0.707, 0.707], [0.707, -0.707], [-0.707, 0.707], [-0.707, -0.707],
];

// Пустой невидимый контейнер — копии создаются лениво при первой активации,
// чтобы никогда не выделявшиеся объекты не плодили спрайты.
export function makeOutline(): Container {
  const c = new Container();
  c.visible = false;
  return c;
}

// Повторяет трансформацию основного спрайта и раздвигает копии на thick пикселей.
export function syncOutline(c: Container, sp: Sprite, color: number, alpha: number, thick = 3) {
  if (c.children.length === 0) for (let i = 0; i < DIRS.length; i++) c.addChild(new Sprite());
  c.visible = true;
  for (let i = 0; i < DIRS.length; i++) {
    const s = c.children[i] as Sprite;
    if (s.texture !== sp.texture) s.texture = sp.texture;
    s.anchor.copyFrom(sp.anchor);
    s.scale.copyFrom(sp.scale);
    s.rotation = sp.rotation;
    s.tint = color;
    s.alpha = alpha;
    s.x = sp.x + DIRS[i][0] * thick;
    s.y = sp.y + DIRS[i][1] * thick;
  }
}

// Прячет контур, если он был активен (без лишней работы, когда уже скрыт).
export function hideOutline(c: Container) {
  if (c.visible) c.visible = false;
}
