// Нижняя контекстная панель: зависит от выделения (юниты / здание / ресурс).
import { G } from '../core/state';
import { assetUrl } from '../data/config';
import { BUILDINGS, BUILD_MENU } from '../data/buildings';
import { UNITS } from '../data/units';
import { TECHS, TECH_ICON } from '../data/techs';
import { canAfford, pay } from '../sim/economy';
import { computePopUsed } from '../sim/entities';
import { startPlacement } from '../sim/placement';
import { sfx } from '../audio/sfx';
import { toast } from './toast';
import { updateHUD } from './hud';
import { iconSVG } from './icons';
import type { Building, Cost, Order, Unit } from '../core/types';
import { RES } from '../data/config';

const el = (id: string) => document.getElementById(id);

function fmtCost(cost: Cost): string {
  const parts = RES.filter(r => cost[r]).map(r => `<span class="ci">${iconSVG(r, 13, 'currentColor', 2.2)}${cost[r]}</span>`);
  return parts.length ? parts.join('') : 'бесплатно';
}

function pct(v: number, total: number): number {
  return Math.max(0, Math.min(100, Math.floor((v / Math.max(0.001, total)) * 100)));
}

function panelShell(info: string, actions: string, queue: string): string {
  return `<div class="panel-shell"><aside class="panel-info">${info}</aside><main class="panel-actions">${actions}</main><aside class="panel-queue">${queue}</aside></div>`;
}

function actionSection(title: string, body: string): string {
  return `<section class="action-section"><div class="label">${title}</div><div class="grid">${body}</div></section>`;
}

function emptyActions(text = 'Нет доступных действий'): string {
  return `<section class="action-section action-empty"><div class="label">Действия</div><div>${text}</div></section>`;
}

function emptyQueue(text = 'Очередь пуста'): string {
  return `<div class="label">Очередь</div><div class="queue empty">${text}</div>`;
}

function selectedCard(title: string, img: string, pills: string, desc?: string): string {
  return `<div class="selected-card">
    <div class="selportrait"><img src="${assetUrl(img)}" alt=""></div>
    <div class="selected-main"><div class="selected-title">${title}</div><div class="selinfo">${pills}</div>${desc ? `<div class="hint">${desc}</div>` : ''}</div>
  </div>`;
}

export function curBuilding(): Building | null {
  return G.selection.length === 1 && G.selection[0].kind === 'building' ? G.selection[0] as Building : null;
}

function buildBtn(k: string): string {
  const d = BUILDINGS[k];
  const locked = k === 'farm' && !G.buildings.some(b => b.key === 'granary' && b.progress >= 1);
  const aff = canAfford(d.cost) && !locked;
  return `<button class="ibtn ${aff ? '' : 'dis'}" data-build="${k}" title="${d.desc}">
    <span class="tile-art"><img src="${assetUrl(d.img)}" alt=""></span><div class="cap">${d.name}</div><div class="cost">${locked ? 'нужен Амбар' : fmtCost(d.cost)}</div></button>`;
}
function trainBtn(t: string): string {
  const d = UNITS[t];
  const aff = canAfford(d.cost) && G.pop.used < G.pop.cap;
  return `<button class="ibtn ${aff ? '' : 'dis'}" data-train="${t}" title="${d.desc}">
    <span class="tile-art"><img src="${assetUrl(d.img)}" alt=""></span><div class="cap">${d.name}</div><div class="cost">${fmtCost(d.cost)}<span class="ci">${iconSVG('pop', 13, 'currentColor', 2.2)}1</span></div></button>`;
}
function techBtn(t: string): string {
  const d = TECHS[t]; const done = G.researched.has(t); const aff = canAfford(d.cost) && !done;
  return `<button class="ibtn ${done ? 'done' : aff ? '' : 'dis'}" data-tech="${t}" title="${d.desc}">
    <span class="tile-art techicon">${iconSVG(TECH_ICON[t] || 'up', 30, 'currentColor', 2)}</span><div class="cap">${d.name}</div><div class="cost">${done ? '✓ изучено' : fmtCost(d.cost)}</div></button>`;
}

function unitOrderName(o: Order | null): string {
  if (!o) return 'Ожидание';
  if (o.type === 'move') return 'Марш';
  if (o.type === 'gather') return 'Добыча';
  if (o.type === 'build') return 'Стройка';
  return 'Атака';
}

function unitQueue(units: Unit[]): string {
  const orders: string[] = [];
  for (const u of units.slice(0, 6)) {
    if (!u.order && !u.queue.length) continue;
    const current = unitOrderName(u.order);
    orders.push(`<div class="qitem order"><b>${u.name}</b><span>${current}</span></div>`);
    for (const o of u.queue.slice(0, 3)) orders.push(`<div class="qitem order queued"><b>${u.name}</b><span>${unitOrderName(o)}</span></div>`);
  }
  if (units.length > 6) orders.push(`<div class="qitem more">ещё ${units.length - 6}</div>`);
  return `<div class="label">Приказы</div><div class="queue">${orders.length ? orders.join('') : '<div class="qempty">Очередь пуста</div>'}</div>`;
}

function buildingQueue(b: Building): string {
  const rows = b.queue.map(j => {
    const name = j.kind === 'unit' ? UNITS[j.id].name : TECHS[j.id].name;
    const icon = j.kind === 'unit'
      ? `<img src="${assetUrl(UNITS[j.id].img)}" alt="">`
      : iconSVG(TECH_ICON[j.id] || 'up', 24, 'currentColor', 2);
    return `<div class="qitem prod"><span class="qicon">${icon}</span><span class="qbody"><b>${name}</b><span class="qbar"><i style="width:${pct(j.t, j.total)}%"></i></span></span></div>`;
  });
  return rows.length
    ? `<div class="label">Очередь</div><div class="queue">${rows.join('')}</div>`
    : emptyQueue();
}

export function renderPanel() {
  const p = el('panel')!; const sel = G.selection;
  if (!sel.length) {
    p.innerHTML = `<div class="panel-empty">Выдели юнита, здание или ресурс</div>`;
    return;
  }
  const units = sel.filter((s): s is Unit => s.kind === 'unit');
  if (units.length) {
    const peasants = units.filter(u => u.type === 'peasant');
    const counts: Record<string, number> = {}; units.forEach(u => counts[u.name] = (counts[u.name] || 0) + 1);
    const title = units.length === 1 ? units[0].name : `Отряд: ${units.length}`;
    const info = selectedCard(title, units[0].def.img,
      Object.entries(counts).map(([n, c]) => `<span class="pill">${n}${c > 1 ? ' ×' + c : ''}</span>`).join(''));
    let actions = '';
    if (peasants.length) {
      actions += actionSection('Строительство', BUILD_MENU.map(k => buildBtn(k)).join(''));
    } else {
      actions += emptyActions('Боевой отряд');
    }
    p.innerHTML = panelShell(info, actions, unitQueue(units));
    return;
  }
  const b = sel[0];
  if (b.kind === 'building') { renderBuildingPanel(b as Building); return; }
  if (b.kind === 'node') {
    const info = selectedCard(b.label, b.img, `<span class="pill">${iconSVG(b.res, 13)} ${Math.ceil(b.amount)}</span>`);
    p.innerHTML = panelShell(info, emptyActions('Ресурсная точка'), emptyQueue());
    return;
  }
}

function renderBuildingPanel(b: Building) {
  const p = el('panel')!; const d = b.def;
  let pills = `<span class="pill">${iconSVG('heart', 13)} <span class="hpval">${Math.ceil(b.hp)}/${b.maxhp}</span></span>`;
  if (b.progress < 1) pills += ` <span class="pill">стройка ${Math.floor(b.progress * 100)}%</span>`;
  const info = selectedCard(d.name, d.img, pills, d.desc);
  let actions = '';
  if (b.progress >= 1) {
    if (d.trains) actions += actionSection('Найм', d.trains.map(t => trainBtn(t)).join(''));
    if (d.research) actions += actionSection('Улучшения', d.research.map(t => techBtn(t)).join(''));
    if (!actions) actions = emptyActions('Пассивное здание');
  } else {
    actions = emptyActions('Идёт строительство');
  }
  p.innerHTML = panelShell(info, actions, buildingQueue(b));
}

// живое обновление панели: доступность кнопок, прогресс очереди, HP
export function updatePanelLive() {
  const p = el('panel'); if (!p || !G.selection.length) return;
  p.querySelectorAll<HTMLElement>('button[data-build]').forEach(btn => {
    const k = btn.dataset.build!, dd = BUILDINGS[k];
    const locked = k === 'farm' && !G.buildings.some(b => b.key === 'granary' && b.progress >= 1);
    btn.classList.toggle('dis', !(canAfford(dd.cost) && !locked));
  });
  p.querySelectorAll<HTMLElement>('button[data-train]').forEach(btn => {
    const dd = UNITS[btn.dataset.train!];
    btn.classList.toggle('dis', !(canAfford(dd.cost) && G.pop.used < G.pop.cap));
  });
  p.querySelectorAll<HTMLElement>('button[data-tech]').forEach(btn => {
    const t = btn.dataset.tech!, done = G.researched.has(t);
    btn.classList.toggle('done', done); btn.classList.toggle('dis', !done && !canAfford(TECHS[t].cost));
  });
  const b = curBuilding();
  if (b) {
    if ((b._qlen || 0) !== b.queue.length) { b._qlen = b.queue.length; renderPanel(); return; }
    const bars = p.querySelectorAll<HTMLElement>('.queue .qbar i');
    b.queue.forEach((j, i) => { if (bars[i]) bars[i].style.width = Math.floor(j.t / j.total * 100) + '%'; });
    const hp = p.querySelector('.hpval'); if (hp) hp.textContent = Math.ceil(b.hp) + '/' + b.maxhp;
  }
}

function enqueueUnit(t: string) {
  const b = curBuilding(); if (!b) return; const d = UNITS[t];
  if (G.pop.used >= G.pop.cap) { toast('Нужны избы — лимит населения'); sfx('error'); return; }
  if (!canAfford(d.cost)) { toast('Не хватает ресурсов'); sfx('error'); return; }
  pay(d.cost); sfx('click');
  b.queue.push({ kind: 'unit', id: t, t: 0, total: d.trainTime || 10 });
  computePopUsed(); renderPanel(); updateHUD();
}
function enqueueTech(t: string) {
  const b = curBuilding(); if (!b) return; const d = TECHS[t];
  if (G.researched.has(t) || b.queue.some(j => j.id === t)) return;
  if (!canAfford(d.cost)) { toast('Не хватает ресурсов'); sfx('error'); return; }
  pay(d.cost); sfx('click'); b.queue.push({ kind: 'tech', id: t, t: 0, total: 22 });
  renderPanel(); updateHUD();
}

export function initPanel() {
  el('panel')!.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('button'); if (!btn) return;
    const b = btn as HTMLButtonElement;
    if (b.dataset.build) {
      const k = b.dataset.build;
      if (G.place && G.place.key === k) G.place = null;   // повторный тап — отмена режима (важно для тача)
      else startPlacement(k);
    }
    else if (b.dataset.train) enqueueUnit(b.dataset.train);
    else if (b.dataset.tech) enqueueTech(b.dataset.tech);
  });
}

// для безголовых тестов
export { enqueueUnit, enqueueTech };
