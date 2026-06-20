// Точка входа: загрузка, главный цикл (фиксированный timestep), старт игры.
import './style.css';
import { G, mouse } from './core/state';
import { MAP } from './data/config';
import { TECHS } from './data/techs';
import { update } from './sim/update';
import { genMap, centerOn } from './sim/map';
import { placeBuilding, spawnUnit, recalcPop } from './sim/entities';
import { gatherOrder, nearestNode } from './sim/commands';
import { pickEnemyTarget } from './sim/units';
import { unitStat } from './sim/economy';
import { tryPlace } from './sim/placement';
import { initPixi, resizeRenderer, R } from './render/context';
import { loadAssets } from './render/assets';
import { buildGround } from './render/ground';
import { syncScene } from './render/scene';
import { fillHudIcons, updateHUD } from './ui/hud';
import { renderPanel, updatePanelLive, initPanel, enqueueUnit } from './ui/panel';
import { initMinimap, drawMinimap } from './ui/minimap';
import { toast, updateToasts } from './ui/toast';
import { ensureAudio, toggleMute } from './audio/sfx';
import { initKeyboard, cameraKeys } from './input/keyboard';
import { selectIdlePeasant } from './input/selection';
import { initPointer } from './input/pointer';
import { initMobile } from './input/mobile';
import { initSettings } from './ui/settings';
import { earlyCall } from './sim/waves';
import { perfSample, togglePerf } from './perf/metrics';
import { settings } from './core/settings';

/* ------------------------------ главный цикл ------------------------------ */
let last = 0, acc = 0, lastFrame = 0;
function loop(ts: number) {
  requestAnimationFrame(loop);
  // ограничение частоты кадров (vsync-предел): пропускаем кадр, пока не набежал бюджет.
  // 1 мс допуск — чтобы при cap == частоте экрана джиттер не ронял нас вдвое.
  const cap = settings.fpsCap;
  if (cap > 0) {
    const minMs = 1000 / cap, elapsed = ts - lastFrame;
    if (elapsed < minMs - 1) return;
    lastFrame = ts - (elapsed % minMs);   // выравниваем сетку кадров без накопления дрейфа
  }
  const dt = Math.min(0.05, (ts - last) / 1000) || 0; last = ts;
  const tFrame = performance.now();
  let simMs = 0, renderMs = 0;
  try {
    cameraKeys(dt);
    if (!G.paused && !G.over) {
      const t0 = performance.now();
      acc += dt; let steps = 0;
      while (acc >= 1 / 30 && steps < 4) { update(1 / 30); acc -= 1 / 30; steps++; }
      simMs = performance.now() - t0;
    }
    const tr = performance.now();
    syncScene(dt);
    R.dragG.clear();
    if (mouse.dragRect) {
      const r = mouse.dragRect;
      R.dragG.rect(r.x, r.y, r.w, r.h).fill({ color: 0xffe89a, alpha: 0.12 }).stroke({ width: 1.5, color: 0xffe89a, alpha: 0.9 });
    }
    R.app.renderer.render(R.app.stage);
    renderMs = performance.now() - tr;
    updateHUD(); updatePanelLive(); drawMinimap();
    perfSample(performance.now() - tFrame, simMs, renderMs);
  } catch (err) { console.error('frame error: ' + ((err as Error)?.stack || err)); }
  updateToasts(dt);
}

/* ------------------------------ старт игры -------------------------------- */
function startGame() {
  document.getElementById('start')!.classList.add('hidden');
  genMap(); buildGround();
  fillHudIcons(); renderPanel(); updateHUD();
  toast('Добро пожаловать в Гардарику! Развивай город и держи 10 волн.', 3.5);
  ensureAudio();
  requestAnimationFrame(loop);
}

// сценарий для безголового теста: ?dev[=full]
function devSeed() {
  const mx = (MAP.W / 2) | 0, my = (MAP.H / 2) | 0;
  G.res = { food: 999, wood: 999, stone: 999, gold: 999 };
  placeBuilding('house', mx + 3, my - 1, true);
  placeBuilding('barracks', mx - 5, my + 2, true);
  placeBuilding('blacksmith', mx + 4, my + 3, true);
  placeBuilding('tower', mx - 2, my - 4, true);
  for (let i = 0; i < 4; i++) placeBuilding('wall', mx - 4 + i, my - 5, true);
  recalcPop();
  for (let i = 0; i < 4; i++) spawnUnit('militia', mx - 4 + i, my + 4, 'player');
  spawnUnit('archer', mx + 1, my + 4, 'player');
  G.units.filter(u => u.type === 'peasant').forEach(u => { const n = nearestNode(u); if (n) gatherOrder(u, n); });
  G.wave.index = 2;
  for (let i = 0; i < 5; i++) { const e = spawnUnit('mongol', mx - 8 + i, my - 8, 'enemy'); pickEnemyTarget(e); }
  G.wave.state = 'active';
}

/* ------------------------------ загрузка ---------------------------------- */
async function boot() {
  await initPixi();
  initKeyboard(); initPointer(); initPanel(); initMobile(); initMinimap(); initSettings();
  window.addEventListener('resize', resizeRenderer);
  document.getElementById('muteBtn')!.addEventListener('click', () => toggleMute());
  document.getElementById('idleBtn')!.addEventListener('click', () => selectIdlePeasant());
  document.getElementById('perfBtn')!.addEventListener('click', () => togglePerf());
  document.getElementById('callWave')!.addEventListener('click', () => earlyCall());
  document.getElementById('startBtn')!.addEventListener('click', startGame);
  document.getElementById('ovRestart')!.addEventListener('click', () => location.reload());

  // API для безголовых тестов и профилирования
  (window as any).__api = {
    G, MAP, TECHS, spawnUnit, placeBuilding, recalcPop, nearestNode, gatherOrder,
    pickEnemyTarget, enqueueUnit, tryPlace, unitStat, centerOn, startGame, devSeed,
    update, syncScene,   // для измерения чистого JS-бюджета кадра (без GPU)
  };

  await loadAssets();
  const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
  document.getElementById('loading')!.classList.add('hidden');
  startBtn.disabled = false; startBtn.textContent = 'Основать город';

  const dev = new URLSearchParams(location.search).get('dev');
  if (dev !== null) { startGame(); if (dev === 'full') devSeed(); }
}

boot();
