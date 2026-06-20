// Завершение игры (победа/поражение) и финальный экран.
import { G } from '../core/state';
import { TOTAL_WAVES } from '../data/config';
import { sfx } from '../audio/sfx';
import { fmtTime } from '../ui/hud';

export function endGame(victory: boolean) {
  G.over = victory ? 'win' : 'lose';
  document.getElementById('overlay')!.classList.remove('hidden');
  document.getElementById('ovTitle')!.textContent = victory ? 'ГАРДАРИКА ВЫСТОЯЛА!' : 'ГОРОД ПАЛ';
  sfx(victory ? 'done' : 'wave');
  document.getElementById('ovText')!.innerHTML = victory
    ? `Вы отразили все ${TOTAL_WAVES} волн орды. Слава защитникам!<br>Население: ${G.pop.used} · Время: ${fmtTime(G.time)}`
    : `Ратуша разрушена на волне ${G.wave.index}. Орда сожгла город.`;
}
