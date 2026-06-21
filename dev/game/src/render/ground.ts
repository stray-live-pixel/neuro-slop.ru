// Изометрическая земля и вода: органичный луг, мягкая песчаная береговая линия,
// отдельный water-layer с GLSL-рябью и лёгкими процедурными волнами.
import { FillPattern, Filter, Sprite, Texture, type Graphics } from 'pixi.js';
import { iso } from '../core/iso';
import { G } from '../core/state';
import { TERRAIN, terrainAt } from '../core/grid';
import { MAP, TILE } from '../data/config';
import { R } from './context';

interface WaveMark {
  x: number;
  y: number;
  phase: number;
  len: number;
  shallow: boolean;
}

interface TerrainBitmapBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

// Подмешать тон к белому (f>0, свет) или к чёрному (f<0, тень).
function shade(hex: number, f: number): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const to = f >= 0 ? 255 : 0, k = Math.min(1, Math.abs(f));
  const mix = (c: number) => Math.round(c + (to - c) * k);
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}
function lerpCol(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, t));
  const m = (sh: number) => Math.round(((a >> sh) & 255) + (((b >> sh) & 255) - ((a >> sh) & 255)) * t);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}
// Детерминированный хеш и сглаженный value-noise (0..1) — органичные пятна.
function hash2(x: number, y: number): number {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const LUSH = 0xa6c178, DRY = 0xc8c98a;
const SAND = 0xd7c28e, WET_SAND = 0xbca47a;
const WATER_DEEP = 0x2f6f89, WATER_MID = 0x3f92a8, WATER_EDGE = 0x75bdc6, WATER_SHALLOW = 0x70b9b3;
const FOAM = 0xd9f1ec, BRIDGE_WOOD = 0x8d6237;
const SHORE_BITMAP_SCALE = 0.38;
const waveMarks: WaveMark[] = [];
let terrainPatterns: Record<string, FillPattern> | null = null;

function waterSurfaceCode(t: number): boolean {
  return t === TERRAIN.WATER || t === TERRAIN.SHALLOW || t === TERRAIN.BRIDGE;
}

function landAt(gx: number, gy: number): boolean {
  const x = Math.floor(gx), y = Math.floor(gy);
  return x >= 0 && y >= 0 && x < MAP.W && y < MAP.H && terrainAt(x, y) === TERRAIN.LAND;
}

function waterNeighborCount(x: number, y: number): number {
  let n = 0;
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
    if (!ox && !oy) continue;
    if (waterSurfaceCode(terrainAt(x + ox, y + oy))) n++;
  }
  return n;
}

function isoDiamond(p: { x: number; y: number }, scale = 1) {
  const TW2 = TILE.w / 2 * scale, TH2 = TILE.h / 2 * scale;
  return [p.x, p.y - TH2, p.x + TW2, p.y, p.x, p.y + TH2, p.x - TW2, p.y];
}

function fillStyle(fill: number | FillPattern, alpha: number) {
  return typeof fill === 'number' ? { color: fill, alpha } : { fill, alpha };
}

function drawDiamond(g: Graphics, p: { x: number; y: number }, fill: number | FillPattern, alpha = 1, stroke?: { color: number; alpha: number; width?: number }) {
  const s = g.poly(isoDiamond(p), true).fill(fillStyle(fill, alpha));
  if (stroke) s.stroke({ width: stroke.width ?? 1, color: stroke.color, alpha: stroke.alpha });
}

function ensureTerrainPatterns() {
  if (terrainPatterns) return terrainPatterns;
  terrainPatterns = {
    grass: new FillPattern({ texture: R.tex['terrain-grass'], repetition: 'repeat', textureSpace: 'global' }),
    water: new FillPattern({ texture: R.tex['terrain-water'], repetition: 'repeat', textureSpace: 'global' }),
    sand: new FillPattern({ texture: R.tex['terrain-sand'], repetition: 'repeat', textureSpace: 'global' }),
    shallow: new FillPattern({ texture: R.tex['terrain-shallow'], repetition: 'repeat', textureSpace: 'global' }),
    bridge: new FillPattern({ texture: R.tex['terrain-bridge'], repetition: 'repeat', textureSpace: 'global' }),
  };
  return terrainPatterns;
}

function ensureWaterFilter() {
  if (R.waterFilter || !R.waterC) return;
  try {
    const filter = Filter.from({
      gl: {
        vertex: `
          in vec2 aPosition;
          out vec2 vTextureCoord;

          uniform vec4 uInputSize;
          uniform vec4 uOutputFrame;
          uniform vec4 uOutputTexture;

          vec4 filterVertexPosition(void) {
            vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
            position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
            position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
            return vec4(position, 0.0, 1.0);
          }

          vec2 filterTextureCoord(void) {
            return aPosition * (uOutputFrame.zw * uInputSize.zw);
          }

          void main(void) {
            gl_Position = filterVertexPosition();
            vTextureCoord = filterTextureCoord();
          }
        `,
        fragment: `
          in vec2 vTextureCoord;
          out vec4 finalColor;
          uniform sampler2D uTexture;
          uniform float uTime;

          void main(void) {
            vec2 uv = vTextureCoord;
            float longWave = sin((uv.x * 31.0 + uv.y * 18.0) + uTime * 0.72);
            float crossWave = sin((uv.x * 17.0 - uv.y * 37.0) - uTime * 1.05);
            vec2 wobble = vec2(longWave * 0.0018 + crossWave * 0.0011,
                               cos((uv.x - uv.y) * 26.0 + uTime * 0.9) * 0.0013);
            vec4 c = texture(uTexture, uv + wobble);
            float glint = smoothstep(0.88, 1.0, sin((uv.x + uv.y) * 145.0 + uTime * 1.65) * 0.5 + 0.5);
            finalColor = vec4(c.rgb + vec3(glint * 0.028) * c.a, c.a);
          }
        `,
      },
      resources: {
        waterUniforms: {
          uTime: { value: 0, type: 'f32' },
        },
      },
      resolution: 0.75,
      padding: 2,
    });
    R.waterFilter = filter;
    R.waterC.filters = [filter];
  } catch (err) {
    console.warn('[Гардарика] water shader disabled:', err);
    R.waterFilter = null;
    R.waterC.filters = [];
  }
}

function drawBridgeSegment(g: Graphics, x0: number, x1: number, y: number) {
  const pat = ensureTerrainPatterns();
  const a = iso(x0 - 0.55, y);
  const b = iso(x1 + 0.55, y);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len, ny = dx / len;
  const half = TILE.h * 0.54;
  const ax = a.x - (dx / len) * TILE.w * 0.3, ay = a.y - (dy / len) * TILE.w * 0.3;
  const bx = b.x + (dx / len) * TILE.w * 0.3, by = b.y + (dy / len) * TILE.w * 0.3;
  const strip = [
    ax + nx * half, ay + ny * half,
    bx + nx * half, by + ny * half,
    bx - nx * half, by - ny * half,
    ax - nx * half, ay - ny * half,
  ];
  g.poly(strip, true).fill({ color: BRIDGE_WOOD, alpha: 0.96 });
  g.poly(strip, true).fill(fillStyle(pat.bridge, 0.34)).stroke({ width: 1.5, color: 0x432916, alpha: 0.58 });

  for (const k of [-0.92, 0.92]) {
    g.moveTo(ax + nx * half * k, ay + ny * half * k)
      .lineTo(bx + nx * half * k, by + ny * half * k)
      .stroke({ width: 3, color: 0x4a2d18, alpha: 0.36 });
    g.moveTo(ax + nx * half * k, ay + ny * half * k - 1)
      .lineTo(bx + nx * half * k, by + ny * half * k - 1)
      .stroke({ width: 1, color: 0xf2c17a, alpha: 0.18 });
  }
  for (let t = TILE.w * 0.15; t < len + TILE.w * 0.4; t += TILE.w * 0.34) {
    const cx = ax + (dx / len) * t, cy = ay + (dy / len) * t;
    g.moveTo(cx + nx * half * 0.72, cy + ny * half * 0.72)
      .lineTo(cx - nx * half * 0.72, cy - ny * half * 0.72)
      .stroke({ width: 1.4, color: 0x2f1d10, alpha: 0.34 });
    g.moveTo(cx + nx * half * 0.62, cy + ny * half * 0.62 - 1)
      .lineTo(cx - nx * half * 0.62, cy - ny * half * 0.62 - 1)
      .stroke({ width: 0.8, color: 0xe7b36d, alpha: 0.14 });
  }
  g.moveTo(ax, ay).lineTo(bx, by).stroke({ width: 1, color: 0x5f3c22, alpha: 0.22 });
}

function clearTerrainTransitions() {
  for (const child of R.terrainTransitionC.removeChildren()) child.destroy();
}

function clearWaterBitmap() {
  for (const child of R.waterBitmapC.removeChildren()) child.destroy();
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function rgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function mixRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  t = clamp01(t);
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function distanceMap(source: (x: number, y: number) => boolean): Float32Array {
  const dist = new Float32Array(MAP.W * MAP.H);
  dist.fill(999);
  const at = (x: number, y: number) => y * MAP.W + x;
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) if (source(x, y)) dist[at(x, y)] = 0;
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const i = at(x, y);
    if (x > 0) dist[i] = Math.min(dist[i], dist[at(x - 1, y)] + 1);
    if (y > 0) dist[i] = Math.min(dist[i], dist[at(x, y - 1)] + 1);
    if (x > 0 && y > 0) dist[i] = Math.min(dist[i], dist[at(x - 1, y - 1)] + 1.414);
    if (x + 1 < MAP.W && y > 0) dist[i] = Math.min(dist[i], dist[at(x + 1, y - 1)] + 1.414);
  }
  for (let y = MAP.H - 1; y >= 0; y--) for (let x = MAP.W - 1; x >= 0; x--) {
    const i = at(x, y);
    if (x + 1 < MAP.W) dist[i] = Math.min(dist[i], dist[at(x + 1, y)] + 1);
    if (y + 1 < MAP.H) dist[i] = Math.min(dist[i], dist[at(x, y + 1)] + 1);
    if (x + 1 < MAP.W && y + 1 < MAP.H) dist[i] = Math.min(dist[i], dist[at(x + 1, y + 1)] + 1.414);
    if (x > 0 && y + 1 < MAP.H) dist[i] = Math.min(dist[i], dist[at(x - 1, y + 1)] + 1.414);
  }
  return dist;
}

function sampleDist(dist: Float32Array, gx: number, gy: number): number {
  const x0 = Math.max(0, Math.min(MAP.W - 1, Math.floor(gx)));
  const y0 = Math.max(0, Math.min(MAP.H - 1, Math.floor(gy)));
  const x1 = Math.min(MAP.W - 1, x0 + 1);
  const y1 = Math.min(MAP.H - 1, y0 + 1);
  const tx = clamp01(gx - x0), ty = clamp01(gy - y0);
  const i00 = y0 * MAP.W + x0, i10 = y0 * MAP.W + x1, i01 = y1 * MAP.W + x0, i11 = y1 * MAP.W + x1;
  const a = dist[i00] + (dist[i10] - dist[i00]) * tx;
  const b = dist[i01] + (dist[i11] - dist[i01]) * tx;
  return a + (b - a) * ty;
}

function gridFromWorld(wx: number, wy: number) {
  const a = wx / (TILE.w / 2), b = wy / (TILE.h / 2);
  return { gx: (a + b) / 2, gy: (b - a) / 2 };
}

function terrainBitmapBounds(): TerrainBitmapBounds {
  const pad = TILE.w * 1.4;
  const minX = -(MAP.H - 1) * TILE.w / 2 - pad;
  const maxX = (MAP.W - 1) * TILE.w / 2 + pad;
  const minY = -TILE.h * 1.4;
  const maxY = (MAP.W + MAP.H - 2) * TILE.h / 2 + TILE.h * 1.8;
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

function makeTerrainCanvas(bounds: TerrainBitmapBounds) {
  const canvas = document.createElement('canvas');
  const scale = SHORE_BITMAP_SCALE;
  canvas.width = Math.ceil(bounds.width * scale);
  canvas.height = Math.ceil(bounds.height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  return ctx ? { canvas, ctx, scale } : null;
}

function addBitmapSprite(container: { addChild: (sp: Sprite) => unknown }, canvas: HTMLCanvasElement, bounds: TerrainBitmapBounds, scale: number) {
  const sp = new Sprite(Texture.from(canvas));
  sp.position.set(bounds.minX, bounds.minY);
  sp.scale.set(1 / scale);
  container.addChild(sp);
}

function drawWaterBitmap(waterDist: Float32Array, landDist: Float32Array, bounds: TerrainBitmapBounds) {
  const made = makeTerrainCanvas(bounds);
  if (!made) return;
  const { canvas, ctx, scale } = made;
  const waterSource = R.tex['terrain-water']?.source?.resource as CanvasImageSource | undefined;
  if (waterSource) {
    const pattern = ctx.createPattern(waterSource, 'repeat');
    if (pattern?.setTransform) pattern.setTransform(new DOMMatrix().scaleSelf(scale));
    ctx.fillStyle = pattern ?? '#2f7f92';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const data = waterSource ? ctx.getImageData(0, 0, canvas.width, canvas.height) : ctx.createImageData(canvas.width, canvas.height);
  if (waterSource) {
    for (let i = 3; i < data.data.length; i += 4) data.data[i] = 0;
  }
  const deep = rgb(WATER_DEEP);
  const mid = rgb(WATER_MID);
  const edge = rgb(WATER_EDGE);
  const shallowCol = rgb(WATER_SHALLOW);

  for (let py = 0; py < canvas.height; py++) for (let px = 0; px < canvas.width; px++) {
    const wx = bounds.minX + (px + 0.5) / scale;
    const wy = bounds.minY + (py + 0.5) / scale;
    const { gx, gy } = gridFromWorld(wx, wy);
    if (gx < -0.5 || gy < -0.5 || gx > MAP.W - 0.5 || gy > MAP.H - 0.5) continue;

    const dWater = sampleDist(waterDist, gx, gy);
    const dLand = sampleDist(landDist, gx, gy);
    const edgeNoise = (noise(gx * 0.82 + 3, gy * 0.82 + 9) - 0.5) * 0.78 + (noise(gx * 2.7 + 11, gy * 2.7 + 4) - 0.5) * 0.22;
    const signed = dLand - dWater + edgeNoise;
    const alpha = Math.min(1, smoothstep(0.02, 0.86, signed) * 1.08);
    if (alpha <= 0.01) continue;

    const tile = terrainAt(Math.floor(gx), Math.floor(gy));
    const region = noise(gx / 7 + 24, gy / 7 + 11);
    const fine = noise(gx / 2.4 + 4, gy / 2.4 + 19);
    const shore = 1 - smoothstep(0.5, 3.2, dLand);
    const ripple = noise(gx * 3.2 + 43, gy * 3.2 + 17) * 0.6 + noise(gx * 8.5 + 4, gy * 8.5 + 23) * 0.4;
    const i = (py * canvas.width + px) * 4;
    const texCol: [number, number, number] = [data.data[i], data.data[i + 1], data.data[i + 2]];
    let col = mixRgb(deep, mid, region * 0.62 + fine * 0.22 + ripple * 0.16);
    if (waterSource) col = mixRgb(texCol, col, 0.42);
    col = mixRgb(col, edge, shore * 0.55);
    if (tile === TERRAIN.SHALLOW) col = mixRgb(col, shallowCol, 0.28);
    const glint = noise(gx * 9.5 + 71, gy * 9.5 + 12);
    if (glint > 0.82 && dLand > 1) col = mixRgb(col, rgb(0xb8e8e5), 0.1);

    data.data[i] = col[0]; data.data[i + 1] = col[1]; data.data[i + 2] = col[2];
    data.data[i + 3] = Math.round(255 * Math.min(0.98, alpha));
  }

  ctx.putImageData(data, 0, 0);
  addBitmapSprite(R.waterBitmapC, canvas, bounds, scale);
}

function drawTerrainBlend(waterDist: Float32Array, landDist: Float32Array, bounds: TerrainBitmapBounds) {
  const made = makeTerrainCanvas(bounds);
  if (!made) return;
  const { canvas, ctx, scale } = made;
  const data = ctx.createImageData(canvas.width, canvas.height);
  const drySand = rgb(0xd9c48b);
  const wetSand = rgb(0xb9a078);
  const grass = rgb(0x8fac61);
  const shallowBlue = rgb(0x6fc0c4);
  const foam = rgb(0xf2f3e6);

  for (let py = 0; py < canvas.height; py++) for (let px = 0; px < canvas.width; px++) {
    const wx = bounds.minX + (px + 0.5) / scale;
    const wy = bounds.minY + (py + 0.5) / scale;
    const { gx, gy } = gridFromWorld(wx, wy);
    if (gx < -0.5 || gy < -0.5 || gx > MAP.W - 0.5 || gy > MAP.H - 0.5) continue;

    const dWater = sampleDist(waterDist, gx, gy);
    const dLand = sampleDist(landDist, gx, gy);
    const shoreNoise = (noise(gx * 0.9 + 17, gy * 0.9 + 31) - 0.5) * 0.78 + (noise(gx * 3.1 + 5, gy * 3.1 + 7) - 0.5) * 0.22;
    const signed = dLand - dWater + shoreNoise;
    const i = (py * canvas.width + px) * 4;

    if (signed < 0.45) {
      const d = dWater + shoreNoise * 0.25;
      const beach = 1 - smoothstep(2.2, 4.15, d);
      if (beach <= 0.01) continue;
      const wet = 1 - smoothstep(0.35, 1.35, d);
      const grassFade = smoothstep(2.15, 4.15, d);
      let col = mixRgb(drySand, wetSand, wet * 0.58);
      col = mixRgb(col, grass, grassFade * 0.45);
      const speck = hash2(Math.floor(gx * 15), Math.floor(gy * 15));
      if (speck > 0.968) col = mixRgb(col, rgb(0x7f6b48), 0.42);
      if (speck < 0.018) col = mixRgb(col, rgb(0xeadfb7), 0.32);
      data.data[i] = col[0]; data.data[i + 1] = col[1]; data.data[i + 2] = col[2];
      data.data[i + 3] = Math.round(255 * Math.min(0.88, (0.18 + beach * 0.7) * (1 - smoothstep(0.25, 0.75, signed))));
    } else {
      const d = dLand - shoreNoise * 0.25;
      const shallow = 1 - smoothstep(1.2, 3.1, d);
      const foamBand = (1 - smoothstep(0.18, 0.72, d)) * (0.35 + noise(gx * 5.2, gy * 5.2 + 11) * 0.65);
      const wet = 1 - smoothstep(0.12, 0.52, d);
      let alpha = shallow * 0.28 + wet * 0.18;
      let col = mixRgb(shallowBlue, wetSand, wet * 0.35);
      if (foamBand > 0.28 && hash2(Math.floor(gx * 6 + gy * 2), Math.floor(gy * 6 - gx * 2)) > 0.42) {
        col = mixRgb(col, foam, Math.min(0.85, foamBand));
        alpha = Math.max(alpha, foamBand * 0.42);
      }
      if (alpha <= 0.01) continue;
      data.data[i] = col[0]; data.data[i + 1] = col[1]; data.data[i + 2] = col[2];
      data.data[i + 3] = Math.round(255 * Math.min(0.62, alpha));
    }
  }

  ctx.putImageData(data, 0, 0);
  addBitmapSprite(R.terrainTransitionC, canvas, bounds, scale);
}

export function buildGround() {
  const ground = R.groundG, water = R.waterG, shore = R.shoreG, fx = R.waterFxG;
  ground.clear(); water.clear(); shore.clear(); fx.clear(); waveMarks.length = 0;
  clearTerrainTransitions();
  clearWaterBitmap();
  ensureWaterFilter();
  const pat = ensureTerrainPatterns();
  const bitmapBounds = terrainBitmapBounds();
  const waterDist = distanceMap((x, y) => waterSurfaceCode(terrainAt(x, y)));
  const landDist = distanceMap((x, y) => terrainAt(x, y) === TERRAIN.LAND);

  const span = MAP.W + MAP.H - 2;
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const p = iso(x, y);
    const terrain = terrainAt(x, y);
    const region = noise(x / 9, y / 9);
    const fine = noise(x / 3.2 + 13, y / 3.2 + 7);
    let tone = lerpCol(LUSH, DRY, region * 0.7 + fine * 0.3);
    tone = shade(tone, (hash2(x * 7 + 1, y * 13 + 3) - 0.5) * 0.05);
    tone = shade(tone, 0.06 - (x + y) / span * 0.16);

    if (terrain === TERRAIN.LAND) {
      const shoreN = waterNeighborCount(x, y);
      if (shoreN) tone = lerpCol(tone, SAND, Math.min(0.1, 0.03 + shoreN * 0.025));
      drawDiamond(ground, p, tone, 1, { color: 0x586741, alpha: shoreN ? 0.06 : 0.14 });
      drawDiamond(ground, p, pat.grass, shoreN ? 0.28 : 0.32);
      drawDiamond(ground, p, tone, shoreN ? 0.18 : 0.12);
      ground.moveTo(p.x - TILE.w / 2, p.y).lineTo(p.x, p.y - TILE.h / 2).lineTo(p.x + TILE.w / 2, p.y)
        .stroke({ width: 1, color: shade(tone, 0.07), alpha: shoreN ? 0.06 : 0.12 });
    } else {
      drawDiamond(ground, p, lerpCol(WET_SAND, SAND, 0.35 + fine * 0.25), 1, { color: 0x8a795c, alpha: 0.1 });
      drawDiamond(ground, p, pat.sand, 0.42);
    }
  }

  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const terrain = terrainAt(x, y);
    if (!waterSurfaceCode(terrain)) continue;
    const p = iso(x, y);
    const shallow = terrain === TERRAIN.SHALLOW;

    if (terrain !== TERRAIN.BRIDGE && hash2(x * 31 + 9, y * 17 + 5) < (shallow ? 0.17 : 0.28)) {
      waveMarks.push({
        x: x + (hash2(x + 71, y + 19) - 0.5) * 0.28,
        y: y + (hash2(x + 13, y + 97) - 0.5) * 0.28,
        phase: hash2(x + 221, y + 139) * Math.PI * 2,
        len: 0.55 + hash2(x + 41, y + 53) * 0.55,
        shallow,
      });
    }

  }

  drawWaterBitmap(waterDist, landDist, bitmapBounds);
  drawTerrainBlend(waterDist, landDist, bitmapBounds);

  for (let y = 0; y < MAP.H; y++) {
    let x = 0;
    while (x < MAP.W) {
      if (terrainAt(x, y) !== TERRAIN.BRIDGE) { x++; continue; }
      const x0 = x;
      while (x + 1 < MAP.W && terrainAt(x + 1, y) === TERRAIN.BRIDGE) x++;
      drawBridgeSegment(shore, x0, x, y);
      x++;
    }
  }

  // ----- декор земли: плотность завязана на noise, чтобы зоны отличались -----
  let seed = 1234;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // мягкие земляные проплешины в сухих зонах
  for (let i = 0; i < Math.round(MAP.W * MAP.H * 0.014); i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (!landAt(gx, gy)) continue;
    if (noise(gx / 9, gy / 9) < 0.55) continue;
    const p = iso(gx, gy), rw = TILE.w * (0.45 + rnd() * 0.7);
    ground.ellipse(p.x, p.y, rw, rw * 0.5).fill({ color: 0xb3a878, alpha: 0.13 });
  }

  // трава пучками — гуще в «зелёных» зонах
  for (let i = 0; i < Math.round(MAP.W * MAP.H * 0.2); i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (!landAt(gx, gy)) continue;
    const lush = 1 - noise(gx / 9, gy / 9);
    if (rnd() > 0.22 + lush * 0.62) continue;
    const p = iso(gx, gy);
    ground.moveTo(p.x, p.y).lineTo(p.x - 2, p.y - 5);
    ground.moveTo(p.x + 2, p.y).lineTo(p.x + 3, p.y - 6);
    ground.moveTo(p.x - 1, p.y).lineTo(p.x + 1, p.y - 4);
  }
  ground.stroke({ width: 1.2, color: 0x82a05f, alpha: 0.5 });

  // редкие цветочки в зелёных зонах
  for (let i = 0; i < Math.round(MAP.W * MAP.H * 0.065); i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (!landAt(gx, gy)) continue;
    if (noise(gx / 9, gy / 9) > 0.5) continue;
    const p = iso(gx, gy);
    const col = rnd() < 0.5 ? 0xf4f0d8 : (rnd() < 0.5 ? 0xf2d65a : 0xe9e2f1);
    ground.circle(p.x, p.y - 2, 1.5).fill({ color: col, alpha: 0.85 });
  }

  // камешки в сухих зонах
  for (let i = 0; i < Math.round(MAP.W * MAP.H * 0.05); i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (!landAt(gx, gy)) continue;
    if (noise(gx / 9, gy / 9) < 0.55) continue;
    const p = iso(gx, gy);
    ground.ellipse(p.x, p.y, 2.2, 1.3).fill({ color: 0x9a9486, alpha: 0.5 });
  }
}

export function updateWater(_dt: number) {
  const filter = R.waterFilter as any;
  if (filter?.resources?.waterUniforms?.uniforms) filter.resources.waterUniforms.uniforms.uTime = G.time;

  const g = R.waterFxG;
  g.clear();
  if (!waveMarks.length) return;
  const limit = Math.min(waveMarks.length, 240);
  for (let i = 0; i < limit; i++) {
    const w = waveMarks[(i * 7) % waveMarks.length];
    const pulse = (Math.sin(G.time * (w.shallow ? 1.1 : 1.45) + w.phase) + 1) * 0.5;
    if (!w.shallow && pulse < 0.18) continue;
    const p = iso(w.x + Math.sin(w.phase) * 0.06, w.y + Math.cos(w.phase) * 0.06);
    const drift = Math.sin(G.time * 0.72 + w.phase) * TILE.h * 0.06;
    const len = TILE.w * w.len * (w.shallow ? 0.34 : 0.48);
    const yy = p.y - TILE.h * (w.shallow ? 0.06 : 0.13) + drift;
    const alpha = (w.shallow ? 0.08 : 0.18) * (0.35 + pulse * 0.65);
    g.moveTo(p.x - len * 0.5, yy)
      .quadraticCurveTo(p.x, yy - TILE.h * 0.09 * (0.35 + pulse), p.x + len * 0.5, yy)
      .stroke({ width: w.shallow ? 1 : 1.35, color: FOAM, alpha });
  }
}
