// Синхронизация сцены: реестр view-контейнеров, обновление, куллинг вне экрана.
import { Container } from 'pixi.js';
import { G } from '../core/state';
import { g2s } from '../core/iso';
import { R } from './context';
import { makeNodeView, updateNodeView } from './views/node';
import { makeBuildingView, updateBuildingView } from './views/building';
import { makeWallView, updateWallView } from './views/wall';
import { makeUnitView, updateUnitView } from './views/unit';
import { makeDecorView } from './views/decor';
import { drawFx } from './fx';
import { updateGhost } from './ghost';
import { updateClouds } from './clouds';
import type { Entity, Decor } from '../core/types';

const viewReg = new Map<Entity, Container>();
const decorReg = new Map<Decor, Container>();
const cullStats = { visible: 0, total: 0 };
export const getCullStats = () => cullStats;

function ensureView<T extends Container>(ent: Entity, make: (e: any) => T): T {
  let v = viewReg.get(ent) as T | undefined;
  if (!v) { v = make(ent); viewReg.set(ent, v); R.objLayer.addChild(v); ent.view = v; }
  return v;
}

// видимость по экрану — отключаем рендер объектов за кадром (важно для 4K/зума)
function cull(gx: number, gy: number, v: Container, VW: number, VH: number, M: number): boolean {
  const s = g2s(gx, gy);
  const on = s.x > -M && s.x < VW + M && s.y > -M - 60 && s.y < VH + M;
  v.renderable = on;
  return on;
}

export function syncScene(dt: number) {
  R.world.position.set(G.cam.x, G.cam.y); R.world.scale.set(G.cam.zoom);
  updateClouds();
  const live = new Set<Entity>();
  const VW = window.innerWidth, VH = window.innerHeight, M = 160;
  let vis = 0, total = 0;

  // декор — статичные view, создаются один раз, только куллинг
  const liveDecor = new Set<Decor>();
  for (const d of G.decor) {
    liveDecor.add(d);
    let v = decorReg.get(d);
    if (!v) { v = makeDecorView(d); decorReg.set(d, v); d.view = v; R.objLayer.addChild(v); }
    total++; if (cull(d.gx, d.gy, v, VW, VH, M)) vis++;
  }
  for (const [d, v] of decorReg) if (!liveDecor.has(d)) { v.destroy({ children: true }); decorReg.delete(d); }

  for (const n of G.nodes) { live.add(n); const v = ensureView(n, makeNodeView); updateNodeView(v, n); total++; if (cull(n.gx, n.gy, v, VW, VH, M)) vis++; }
  for (const b of G.buildings) {
    live.add(b);
    if (b.def.wall) { const v = ensureView(b, makeWallView); updateWallView(v, b, dt); total++; if (cull(b.cx, b.cy, v, VW, VH, M)) vis++; }
    else { const v = ensureView(b, makeBuildingView); updateBuildingView(v, b, dt); total++; if (cull(b.cx, b.cy, v, VW, VH, M)) vis++; }
  }
  for (const u of G.units) { live.add(u); const v = ensureView(u, makeUnitView); updateUnitView(v, u, dt); total++; if (cull(u.gx, u.gy, v, VW, VH, M)) vis++; }

  for (const [ent, v] of viewReg) if (!live.has(ent)) { v.destroy({ children: true }); viewReg.delete(ent); }

  cullStats.visible = vis; cullStats.total = total;
  drawFx(dt);
  updateGhost();
}
