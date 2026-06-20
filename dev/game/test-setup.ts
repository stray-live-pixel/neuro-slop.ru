// Тестовое окружение: прикидываемся десктопом.
// jsdom под vitest объявляет window.ontouchstart, из-за чего IS_TOUCH (input/device.ts)
// вычислялся бы как true и edge-scroll (работает только для мыши) не запускался бы в тестах.
// Снимаем тач-признаки ДО импорта модулей игры — setupFiles выполняются раньше тест-файлов.
delete (window as any).ontouchstart;
Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
