// Вид юнита: процедурная анимация (ходьба/работа/удар/дыхание), тень,
// выделение, HP-бар и бейдж текущего действия.
import { Container, Graphics, Sprite } from 'pixi.js';
import { G } from '../../core/state';
import { iso } from '../../core/iso';
import { TILE, FEET } from '../../data/config';
import { unitStat } from '../../sim/economy';
import { unitAction, badgeFor } from '../../sim/units';
import { spawnWorkParticle } from '../../sim/effects';
import { R } from '../context';
import { drawBarG, drawGroundShadow } from '../draw';
import type { Unit } from '../../core/types';

interface BadgeContainer extends Container { bg: Graphics; ic: Sprite; }
export interface UnitView extends Container {
  sh: Graphics; sel: Graphics; sp: Sprite; bar: Graphics; badge: BadgeContainer;
  fxT: number; curImg: string | null; selOn: boolean; barOn: boolean; curBadge: string | null;
  baseScale: number; texW: number; spriteH: number;
}

export function makeUnitView(_u: Unit): UnitView {
  const c = new Container() as UnitView;
  c.sh = c.addChild(new Graphics());
  c.sel = c.addChild(new Graphics());
  c.sp = c.addChild(new Sprite()); c.sp.anchor.set(0.5, 1);
  c.bar = c.addChild(new Graphics());
  const badge = c.addChild(new Container()) as BadgeContainer;
  badge.bg = badge.addChild(new Graphics());
  badge.bg.roundRect(-11, -11, 22, 22, 7).fill({ color: 0x2a2418, alpha: 0.85 }).stroke({ width: 1.5, color: 0xf0e0b4, alpha: 0.7 });
  badge.ic = badge.addChild(new Sprite()); badge.ic.anchor.set(0.5); badge.ic.scale.set(0.4);
  badge.visible = false; c.badge = badge;
  c.fxT = 0; c.curImg = null; c.selOn = false; c.barOn = false; c.curBadge = null;
  c.baseScale = 1; c.texW = 40; c.spriteH = 40;
  return c;
}

export function updateUnitView(c: UnitView, u: Unit, dt: number) {
  const st = unitStat(u); const t = R.tex[st.img];
  if (c.curImg !== st.img) {
    c.curImg = st.img; c.sp.texture = t;
    const bodyH = TILE.h * (u.def.img === 'mongol-rider' ? 2.0 : 1.62);
    c.baseScale = bodyH / (t.height || bodyH); c.texW = t.width || 40; c.spriteH = c.baseScale * (t.height || 40);
    c.sh.clear(); drawGroundShadow(c.sh, 0, FEET, c.baseScale * c.texW * 0.23, TILE.h * 0.12, 0.36);
  }
  const p = iso(u.gx, u.gy); c.position.set(p.x, p.y); c.zIndex = u.gx + u.gy + 0.4;
  const tm = G.time, facing = u.vx < 0 ? -1 : 1;
  const arrived = !u.path || u.wp >= u.path.length;
  const act = unitAction(u, arrived);
  let bobY = 0, rot = 0, breathe = 1, lungeX = 0;
  if (!arrived) { bobY = -Math.abs(Math.sin(tm * 11 + u.id)) * TILE.h * 0.11; rot = Math.sin(tm * 11 + u.id) * 0.05 * facing; }
  else if (act === 'chop' || act === 'mine' || act === 'build' || act === 'farm') {
    rot = Math.sin(tm * 13 + u.id) * 0.26 * facing; bobY = -Math.abs(Math.sin(tm * 13)) * 2;
    c.fxT -= dt; if (c.fxT <= 0) { c.fxT = 0.17; spawnWorkParticle(u, act); }
  } else { breathe = 1 + Math.sin(tm * 2.4 + u.id) * 0.025; }
  if ((u._lunge || 0) > 0) { u._lunge = Math.max(0, u._lunge! - dt * 5); lungeX = facing * Math.sin((1 - u._lunge!) * Math.PI) * TILE.w * 0.13; }
  c.sp.scale.set(facing * c.baseScale, c.baseScale * breathe);
  c.sp.rotation = rot; c.sp.x = lungeX; c.sp.y = FEET + bobY;
  if ((u._hurt || 0) > 0) { c.sp.tint = 0xff8a6a; u._hurt = Math.max(0, u._hurt! - dt * 4); } else c.sp.tint = 0xffffff;

  // выделение (перерисовываем только у выделённых — пульс)
  const selOn = G.selection.includes(u);
  if (selOn) {
    c.sel.clear();
    const pa = 0.65 + 0.35 * Math.sin(tm * 5);
    c.sel.ellipse(0, FEET, TILE.w * 0.3, TILE.h * 0.18).stroke({ width: 2.4, color: u.side === 'enemy' ? 0xff6a5a : 0xffe07a, alpha: pa });
  } else if (c.selOn) c.sel.clear();
  c.selOn = selOn;

  // hp-бар (только у раненых)
  if (u.hp < u.maxhp) {
    c.bar.clear();
    drawBarG(c.bar, 0, FEET - c.spriteH - 5, Math.min(48, c.spriteH * 0.5 + 18), u.hp / u.maxhp, u.side === 'player' ? 0x6fcf6f : 0xe2685f);
    c.barOn = true;
  } else if (c.barOn) { c.bar.clear(); c.barOn = false; }

  // бейдж действия (только у игрока)
  const bk = u.side === 'player' ? badgeFor(act) : null;
  if (bk && R.badge[bk]) {
    c.badge.visible = true;
    if (c.curBadge !== bk) { c.badge.ic.texture = R.badge[bk]!; c.curBadge = bk; }
    c.badge.position.set(0, FEET - c.spriteH - 18 - (u.hp < u.maxhp ? 8 : 0));
    c.badge.scale.set(1 + Math.sin(tm * 6) * 0.07);
  } else c.badge.visible = false;
}
