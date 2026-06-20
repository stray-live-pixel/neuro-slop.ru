import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Тесты игры «Гардарика». Запуск из dev/: `npm run game:test`.
// jsdom — чтобы покрыть ввод (pointer events, камера) без реального браузера.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.test.ts'],
  },
});
