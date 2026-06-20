// Всплывающие подсказки-уведомления.
interface Toast { msg: string; t: number; life: number; }
let toasts: Toast[] = [];

function render() {
  const el = document.getElementById('toasts');
  if (el) el.innerHTML = toasts.map(t => `<div class="toast">${t.msg}</div>`).join('');
}

export function toast(msg: string, life?: number) {
  toasts.push({ msg, t: 0, life: life || 1.8 });
  if (toasts.length > 4) toasts.shift();
  render();
}

// гасим по таймеру (вызывается из главного цикла)
export function updateToasts(dt: number) {
  if (!toasts.length) return;
  toasts.forEach(t => t.t += dt);
  if (toasts.some(t => t.t > t.life)) { toasts = toasts.filter(t => t.t < t.life); render(); }
}
