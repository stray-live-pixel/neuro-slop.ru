import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Сборка игры «Гардарика» в статический каталог сайта.
// Источник — этот каталог (dev/game), результат — dev/public/lab/gardarika/,
// откуда Astro раздаёт его как обычную статику по адресу /lab/gardarika/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/lab/gardarika/',
  build: {
    outDir: fileURLToPath(new URL('../public/lab/gardarika', import.meta.url)),
    emptyOutDir: true,        // outDir вне root — чистим явно
    assetsDir: 'build',       // бандл в build/, чтобы не путать со статикой assets/
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
