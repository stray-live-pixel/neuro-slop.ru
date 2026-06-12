# neuro-slop.ru

Сайт-лаборатория экспериментов с нейросетями: записи (статьи, промпты, наблюдения, новости, сравнения) и отдельные сгенерированные сайты. Статика на Astro. Исходники — в `dev/`, собранный сайт лежит в корне репозитория и раздаётся GitHub Pages из ветки `main`.

## Контент

- **Записи** — markdown-файлы в `dev/src/content/posts/`. Фронтматтер: `title`, `description`, `date`, `category` (одна из: `experiments`, `articles`, `prompts`, `notes`, `news`, `comparisons`), опционально `draft: true`. Имя файла = слаг URL (`/posts/<имя>/`), писать его латиницей.
- **Категории** (названия, эмодзи, описания) — в `dev/src/lib/categories.ts`; новые категории добавлять туда и в enum в `dev/src/content.config.ts`.
- **Отдельные сгенерированные сайты** — кладутся целиком в `dev/public/lab/<имя>/` и попадают на `neuro-slop.ru/lab/<имя>/`.
- Карточка записи — компонент `dev/src/components/PostCard.astro`; типографика markdown — класс `.prose` в `global.css`.
- В `dev/src/content/posts/` лежат записи-примеры с префиксом `primer-` — удалить, когда появится настоящий контент.

## Рабочий цикл

```bash
cd dev
npm run dev     # локальная разработка
npm run build   # сборка в dev/dist + копирование результата в корень репозитория
```

Никогда не направлять `outDir` Astro в корень репозитория — Astro очищает выходную папку перед сборкой. Сборка идёт в `dev/dist`, скрипт `sync` копирует её в корень. Файлы сайта в корне (`index.html`, `_astro/`, `CNAME`, `.nojekyll`) — артефакты сборки, их не редактируют руками, но коммитят.

## Дизайн-система: Tailwind 4 + Fulldev UI

Стек: Tailwind CSS 4 (vite-плагин) + компоненты [Fulldev UI](https://ui.full.dev) в `dev/src/components/ui/` (shadcn-стиль: код лежит в проекте, его можно править). Новые компоненты ставятся через `npx shadcn@latest add @fulldev/<имя>` (реестр настроен в `dev/components.json`, алиас `@/*` → `src/*`).

Визуальный язык — «яркий минимализм»: нейтральные поверхности с лёгким фиолетовым подтоном, один электрический акцент (`--primary`), фирменный нейро-градиент. Все токены — CSS-переменные в `dev/src/styles/global.css` (`--background`, `--foreground`, `--card`, `--muted-foreground`, `--border`…), в разметке использовать Tailwind-классы от токенов (`bg-card`, `text-muted-foreground`), не сырые цвета.

### Принципы

- **Темы**: светлая в `:root`, тёмная в `.dark` — переключатель в шапке (`ThemeToggle`), выбор хранится в localStorage, по умолчанию системная. Инициализация — inline-скрипт в `<head>` `Layout.astro` (без мигания). Новые цвета добавлять в обе ветки.
- **Системный шрифт SF** (`--font-sans` начинается с `-apple-system`), никаких веб-шрифтов. Заголовки `font-bold` с `tracking` до −0.035em, базовый текст 17px.
- **Нейро-градиент** `--gradient-brand` (`108deg, #0894ff → #c959dd → #ff2e54 → #ff9004`): классы `.text-gradient` (+ `.text-gradient-animated` для переливания) и градиентная обводка карточек `.glow-card` при hover. Использовать точечно.
- **Анимированный фон** — `dev/src/components/Background.astro`: aurora-пятна (дрейф на keyframes), точечная сетка, свечение за курсором (rAF + lerp). Подключён в `Layout.astro`, всё гасится при `prefers-reduced-motion`.
- **Ширина**: шапка и футер до `max-w-[1920px]`, контентные сетки `max-w-[1440px]`, текст записи ~760px. Экраны 21:9 поддерживаются — фон и hero тянутся на всю ширину.
- **Карточки**: `glow-card bg-card/60 border border-border/60 rounded-2xl backdrop-blur-sm` + hover-подъём. Кнопки — `Button` из `@/components/ui/button` (полиморфная: с `href` рендерится как `<a>`), скругление добивать `class="rounded-full"`.
- Markdown-типографика записей — класс `.prose` в `global.css`; подсветка кода Shiki в две темы (`github-light`/`github-dark`, переключение через `.dark` в CSS).

### Чего не делать

- Не возвращать eager-глоб всех иконок в `dev/src/components/ui/icon/icon.astro` — он тащит в сборку ~5400 SVG (22 МБ). Нужные иконки lucide добавлять в список `import.meta.glob` явно.
- Не перегружать страницы декором — стиль держится на воздухе, крупной типографике и точечных градиентных акцентах.
- Не редактировать компоненты в `src/components/ui/` без нужды — это вендореный код Fulldev; свои компоненты класть в `src/components/`.

Каждая новая страница (`dev/src/pages/*.astro`) оборачивается в `Layout.astro` — он подключает глобальные стили, фон, шапку с переключателем темы и футер.
