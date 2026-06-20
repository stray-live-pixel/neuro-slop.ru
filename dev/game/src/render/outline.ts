// Силуэтный контур по PNG-ассету: ОДНА копия спрайта позади оригинала, увеличенная
// на несколько пикселей. Копия использует заранее сгенерированную БЕЛУЮ версию текстуры
// (RGB→белый, альфа сохранена) — наружу торчат только её края. Дёшево: без пофреймовых
// фильтров, белая текстура генерится один раз на ассет; цвет/прозрачность — через tint/alpha.
import { Container, Sprite, ColorMatrixFilter, Texture } from 'pixi.js';
import { R } from './context';

const whiteCache = new Map<Texture, Texture>();

// Белая силуэт-версия текстуры. Генерится один раз и кешируется по исходной текстуре.
function whiteTex(src: Texture): Texture {
  let w = whiteCache.get(src);
  if (w) return w;
  try {
    const tmp = new Sprite(src);
    const f = new ColorMatrixFilter();
    f.padding = 0;                                  // не-пространственный фильтр → размер = исходный
    f.matrix = [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0];
    tmp.filters = [f];
    w = R.app.renderer.generateTexture({ target: tmp, resolution: 1, antialias: true });
    tmp.destroy();
  } catch {
    w = src;                                        // headless/без рендерера (тесты) — деградация
  }
  whiteCache.set(src, w);
  return w;
}

// Пустой невидимый контейнер — спрайт создаётся лениво при первой активации.
export function makeOutline(): Container {
  const c = new Container();
  c.visible = false;
  return c;
}

// Повторяет трансформацию основного спрайта и раздувает силуэт на thick px (центр на месте).
export function syncOutline(c: Container, sp: Sprite, color: number, alpha: number, thick = 3) {
  let s = c.children[0] as Sprite | undefined;
  if (!s) s = c.addChild(new Sprite());
  c.visible = true;
  const wt = whiteTex(sp.texture);
  if (s.texture !== wt) s.texture = wt;
  s.anchor.copyFrom(sp.anchor);
  s.rotation = sp.rotation;
  s.tint = color;
  s.alpha = alpha;
  // равномерное (без искажений) увеличение под ~thick px по большей стороне
  const w = Math.abs(sp.scale.x) * (s.texture.width || 1);
  const h = Math.abs(sp.scale.y) * (s.texture.height || 1);
  const d = Math.max(w, h) || 1;
  const f = (d + 2 * thick) / d;
  s.scale.set(sp.scale.x * f, sp.scale.y * f);
  // сдвиг, чтобы центр силуэта совпал с центром спрайта (учёт якоря и знака масштаба)
  const sgx = sp.scale.x < 0 ? -1 : 1, sgy = sp.scale.y < 0 ? -1 : 1;
  s.x = sp.x + (sp.anchor.x - 0.5) * sgx * w * (f - 1);
  s.y = sp.y + (sp.anchor.y - 0.5) * sgy * h * (f - 1);
}

// Прячет контур, если он был активен (без лишней работы, когда уже скрыт).
export function hideOutline(c: Container) {
  if (c.visible) c.visible = false;
}
