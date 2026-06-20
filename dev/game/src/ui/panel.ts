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
import type { Building, Cost, Unit } from '../core/types';
import { RES } from '../data/config';

const el = (id: string) => document.getElementById(id);

function fmtCost(cost: Cost): string {
  const parts = RES.filter(r => cost[r]).map(r => `<span class="ci">${iconSVG(r, 13, 'currentColor', 2.2)}${cost[r]}</span>`);
  return parts.length ? parts.join('') : 'бесплатно';
}

export function curBuilding(): Building | null {
  return G.selection.length === 1 && G.selection[0].kind === 'building' ? G.selection[0] as Building : null;
}

function buildBtn(k: string): string {
  const d = BUILDINGS[k];
  const locked = k === 'farm' && !G.buildings.some(b => b.key === 'granary' && b.progress >= 1);
  const aff = canAfford(d.cost) && !locked;
  return `<button class="ibtn ${aff ? '' : 'dis'}" data-build="${k}" title="${d.desc}">
    <img src="${assetUrl(d.img)}"><div class="cap">${d.name}</div><div class="cost">${locked ? 'нужен Амбар' : fmtCost(d.cost)}</div></button>`;
}
function trainBtn(t: string): string {
  const d = UNITS[t];
  const aff = canAfford(d.cost) && G.pop.used < G.pop.cap;
  return `<button class="ibtn ${aff ? '' : 'dis'}" data-train="${t}" title="${d.desc}">
    <img src="${assetUrl(d.img)}"><div class="cap">${d.name}</div><div class="cost">${fmtCost(d.cost)}<span class="ci">${iconSVG('pop', 13, 'currentColor', 2.2)}1</span></div></button>`;
}
function techBtn(t: string): string {
  const d = TECHS[t]; const done = G.researched.has(t); const aff = canAfford(d.cost) && !done;
  return `<button class="ibtn ${done ? 'done' : aff ? '' : 'dis'}" data-tech="${t}" title="${d.desc}">
    <div class="techicon">${iconSVG(TECH_ICON[t] || 'up', 30, 'currentColor', 2)}</div><div class="cap">${d.name}</div><div class="cost">${done ? '✓ изучено' : fmtCost(d.cost)}</div></button>`;
}

export function renderPanel() {
  const p = el('panel')!; const sel = G.selection;
  if (!sel.length) {
    p.innerHTML = `<div class="hint">Выдели юнита или здание. С выделенными крестьянами выбери здание ниже и поставь его на землю. ПКМ / тап — приказ.</div>`;
    return;
  }
  const units = sel.filter((s): s is Unit => s.kind === 'unit');
  if (units.length) {
    const peasants = units.filter(u => u.type === 'peasant');
    let html = `<div class="selinfo">`;
    const counts: Record<string, number> = {}; units.forEach(u => counts[u.name] = (counts[u.name] || 0) + 1);
    html += Object.entries(counts).map(([n, c]) => `<span class="pill">${n}${c > 1 ? ' ×' + c : ''}</span>`).join('');
    html += `</div>`;
    if (peasants.length) {
      html += `<div class="label">Строительство</div><div class="grid">`;
      html += BUILD_MENU.map(k => buildBtn(k)).join('');
      html += `</div>`;
      html += `<div class="hint">Зажми <b>Shift</b> — ставь стройки в очередь. <b>Частокол</b> можно тянуть <b>линией</b> — крестьянин пройдёт её по порядку.</div>`;
    }
    p.innerHTML = html;
    return;
  }
  const b = sel[0];
  if (b.kind === 'building') { renderBuildingPanel(b as Building); return; }
  if (b.kind === 'node') {
    p.innerHTML = `<div class="selinfo"><span class="pill">${b.label}</span> <span class="pill">${iconSVG(b.res, 13)} ${Math.ceil(b.amount)}</span></div><div class="hint">Прикажи крестьянам (ПКМ / тап) добывать этот ресурс.</div>`;
    return;
  }
}

function renderBuildingPanel(b: Building) {
  const p = el('panel')!; const d = b.def;
  let html = `<div class="selinfo"><span class="pill">${d.name}</span> <span class="pill">${iconSVG('heart', 13)} <span class="hpval">${Math.ceil(b.hp)}/${b.maxhp}</span></span>`;
  if (b.progress < 1) html += ` <span class="pill">стройка ${Math.floor(b.progress * 100)}%</span>`;
  html += `</div>`;
  if (b.progress >= 1) {
    if (d.trains) html += `<div class="label">Найм</div><div class="grid">` + d.trains.map(t => trainBtn(t)).join('') + `</div>`;
    if (d.research) html += `<div class="label">Улучшения</div><div class="grid">` + d.research.map(t => techBtn(t)).join('') + `</div>`;
    if (b.queue.length) html += `<div class="label">Очередь</div><div class="queue">` + b.queue.map(j => `<div class="qitem">${j.kind === 'unit' ? UNITS[j.id].name : TECHS[j.id].name}<div class="qbar"><i style="width:${Math.floor(j.t / j.total * 100)}%"></i></div></div>`).join('') + `</div>`;
    if (d.desc) html += `<div class="hint">${d.desc}</div>`;
  } else html += `<div class="hint">Идёт строительство. Прикажи крестьянам (ПКМ / тап) помочь.</div>`;
  p.innerHTML = html;
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
