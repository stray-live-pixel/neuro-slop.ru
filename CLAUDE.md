# neuro-slop.ru — инструкции для Claude и Codex

Сайт-лаборатория экспериментов с нейросетями: игры, сгенерированные нейросетями, новости и промпты. Статика на Astro. Исходники — в `dev/`. Живой сайт раздаёт Caddy на VPS из `/root/chat-server/site/` (туда же проксируется чат-бот по `/api/*` — single-origin); как публиковать — раздел «Рабочий цикл → Деплой». GitHub Pages отключён (аккаунт под флагом), поэтому `git push` сам по себе сайт больше не обновляет.

## Точки входа для ассистентов

- `CLAUDE.md` — основной файл инструкций для Claude.
- `AGENTS.md` — точка входа для Codex; это символическая ссылка на `CLAUDE.md`.
- `.claude/skills` и `.claude/agents` — основной источник скиллов и агентов.
- `.codex/skills` и `.codex/agents` — символические ссылки на соответствующие `.claude/*` директории.

Не дублируй инструкции между Claude и Codex: редактируй общий источник (`CLAUDE.md` или файлы в `.claude/*`), а symlink-точки входа оставляй ссылками. Если в старом тексте встречаются Claude-названия инструментов (`Read`, `Write`, `Edit`, `Bash`, `WebFetch`, `WebSearch`, `Agent`), в Codex используй ближайший доступный эквивалент: чтение/правку файлов, shell, web-поиск и subagent/multi-agent, если он доступен.

## Два репозитория: публичный и приватный

Проект разнесён по двум репозиториям с чётким разделением:

- **`neuro-slop.ru` (этот, публичный)** — только **бесплатный публичный контент и код сайта**: статьи, расшифровки, игры в `/lab/`, вёрстка, дизайн-система. Это публичный репозиторий на GitHub (живой сайт раздаётся с VPS — см. «Рабочий цикл → Деплой»), поэтому **всё его содержимое считается публичным**.
- **`private-neuro-slop` (приватный)** — всё, **на чём можно заработать или что даёт преимущество**: платные/закрытые функции, скрипты генерации контента, логика получения видео с YouTube, правила формирования статей, заготовки анализов (`transcribed-articles/`), стратегия монетизации (`monetization-roadmap.md`), ключи и приватные данные.

**ВАЖНО — никогда не размещай в этом публичном репозитории то, что приносит деньги или даёт конкурентное преимущество.** Сюда попадает только готовый бесплатный результат (опубликованная статья/игра). Пайплайны, промпты-генераторы, монетизационная логика, скрипты добычи и обработки видео, любые секреты — живут в `private-neuro-slop`. Если задача требует создать такой артефакт — создавай его в приватном репозитории, а в публичный коммить лишь итоговый бесплатный контент.

## Контент

- **Записи** — markdown-файлы в `dev/src/content/posts/`. Фронтматтер: `title`, `description`, `date`, `category` (`news`, `games` или `prompts`), `cover` (путь к фоновой картинке — у каждой записи должна быть) и опционально `draft: true`. Имя файла = слаг URL (`/posts/<имя>/`), писать его латиницей. Черновики (`draft: true`) видны в `npm run dev`, но не попадают в сборку.
- **Категории** — в `dev/src/lib/categories.ts`: у каждой `label`, `icon` (имя lucide-иконки, её надо добавить в глоб `dev/src/components/ui/icon/icon.astro`), `description` и `gradient` (свой градиент категории, используется в бейджах, плитках разделов и как фон карточки без `cover`). Новые категории добавлять туда и в enum в `dev/src/content.config.ts`.
- **Отдельные сгенерированные сайты и игры** — кладутся целиком в `dev/public/lab/<имя>/` (минимум `index.html`, рядом js/ассеты) и попадают на `neuro-slop.ru/lab/<имя>/`.
- **Спрайты игр и игровые картинки** — после генерации и перед вставкой в игру их **обязательно нормализовать и оптимизировать**: контент по центру, **без пустых полей по бокам** и без полупрозрачного «ореола» фона. Движок масштабирует спрайт «под завязку» тайла (по ширине/высоте картинки) и якорит по низу-центру, поэтому лишние прозрачные поля смещают и уменьшают объект, а недочищенный фон даёт призрачный квадрат вокруг. Как чистить (инструмент `sharp`, есть в `dev/node_modules`; проверять результат глазами по альфа-каналу): 1) обнулить фоновую дымку — пиксели с α ниже ~32; 2) найти связные компоненты по альфе (порог α≥64) и оставить значимые — ≥10% от крупнейшего, чтобы не потерять составной спрайт (несколько деревьев, пила у лесопилки); 3) обрезать в плотную рамку по объединённому bbox с маленьким полем ~6px и **центрировать**. Финальный формат для игры — **WebP**: для прозрачных спрайтов конвертировать через `sharp` с `webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true })`, для обложек/фонов можно `quality: 86`; после смены расширений обновить ссылки в коде/фронтматтере. После замены ассетов пересобрать игру её `vite build`, чтобы чистые копии уехали в `dev/public/lab/<игра>/assets/`. Сами ассеты генерит скилл `.claude/skills/game-asset/` — нормализация и WebP-оптимизация это финальный шаг перед коммитом.
- **Записи-игры** (`category: games`) — обычная запись с доп. полями фронтматтера: `model` (название модели), `timeSpent` (время разработки), `gameUrl` (ссылка на игру, обычно `/lab/<имя>/`), `cover` (обложка, обычно `/lab/<имя>/cover.<ext>`). При наличии `gameUrl` страница записи показывает метаданные (модель · версия от `date` · время) и баннер с обложкой и кнопкой «Играть» (открывает игру в новой вкладке).
- Карточка записи — `dev/src/components/PostCard.astro`: горизонтальная, `cover` растянут фоном с лёгким blur и тёмным градиентом, текст поверх — белый. Обложки не-игровых записей кладутся в `dev/public/images/covers/`. Типографика markdown — класс `.prose` в `global.css`.
- **Разборы** (`/transcripts/`) — отдельная коллекция `transcripts` (не `posts`), интерактивные разборы любого источника: **видео, подкаста, статьи или сводного анализа** нескольких материалов. Раздел в UI называется «Разборы» (`TRANSCRIPTS_SECTION.label`), но URL и имя коллекции остаются `transcripts` (SEO). Каждая статья = папка `dev/src/content/transcripts/<slug>/` с `index.md` (структура + тело-разбор) и опциональным `transcript.md` (полная расшифровка, не публикуется — коллекция грузит только `index.md`). Богатый фронтматтер: `tldr`, `video`, `ratings[]`, `tags[]`, `insights[]`, `tips[]`, `flowchart[]`, `plan[]`, `quiz[]`, `related[]` (см. Zod-схему в `content.config.ts`). **Тип источника** задаётся полем `video.kind` (`video` | `podcast` | `article` | `analysis` | `other`); если не задан — выводится (YouTube → `video`, иначе `other`). От `kind` зависят все подписи на странице и карточке (CTA «Слушать подкаст» / «Читать статью» / «Открыть ключевую ссылку», заголовки блоков, подпись даты, бейдж и фильтр по типу) — вся логика в `dev/src/lib/source.ts`. Раздел описан в `TRANSCRIPTS_SECTION`/`SECTIONS` в `categories.ts`; теги — каталог `dev/src/lib/tags.ts`. Интерактивные блоки — `dev/src/components/transcript/`, страницы — `dev/src/pages/transcripts/`. Живое оглавление с фильтром по тегам и по типу источника генерируется само на `/transcripts/`. **Голосовая выжимка** (только новые статьи) — опциональное поле `audio` (`src`, `duration`, `durationSeconds`, `voice`, `script`): короткая озвучка самого ценного из разбора. mp3 лежит в `dev/public/audio/<slug>.mp3` (отдаётся с `/audio/<slug>.mp3`), на странице рендерится плеером `AudioDigest.astro` сразу после блока «Коротко» (текст выжимки — под cut). Сам mp3 и текст генерирует приватный пайплайн (Yandex SpeechKit, `private-neuro-slop/tts/`); сюда попадает только готовый результат. Как собирать такую статью — скилл `.claude/skills/transcript-article/` (в Codex тот же путь доступен как `.codex/skills/transcript-article/`) и агенты `video-analyst` / `transcript-builder` из `.claude/agents` или `.codex/agents`.

## Рабочий цикл

### Локально

```bash
cd dev
npm run dev     # локальная разработка
npm run build   # сборка в dev/dist + копирование результата в корень репозитория (sync)
```

Никогда не направлять `outDir` Astro в корень репозитория — Astro очищает выходную папку перед сборкой. Сборка идёт в `dev/dist`, скрипт `sync` копирует её в корень. Файлы сайта в корне (`index.html`, `_astro/`, `CNAME`, `.nojekyll`) — артефакты сборки, их не редактируют руками, но коммитят (история; на живой сайт они больше не влияют).

### Деплой (публикация обновлений)

Живой сайт раздаёт **Caddy на VPS** (`root@77.105.170.239`) из папки `/root/chat-server/site/`; `/api/*` Caddy проксирует на локального чат-бота, поэтому фронт и API — один origin (`https://neuro-slop.ru`). **GitHub Pages выключен** (аккаунт под флагом) — `git push` обновляет только историю исходников, на живой сайт не влияет. Публикация = собрать статику и залить её на сервер по rsync:

```bash
cd dev
PUBLIC_CHAT_API=https://neuro-slop.ru npx astro build              # сборка с same-origin API (/api/*)
rsync -avz --delete dist/ root@77.105.170.239:/root/chat-server/site/
```

- `PUBLIC_CHAT_API=https://neuro-slop.ru` **обязателен**: иначе фронт уйдёт на запасной endpoint (`*.sslip.io`) вместо same-origin `/api/*`. Поэтому для деплоя именно `npx astro build` с этим env, а не `npm run build` (тот ещё и копирует `dist` в корень репозитория — для живого сайта не нужно).
- `--delete` убирает на сервере файлы, которых уже нет в свежей сборке.
- Caddy подхватывает файлы сразу (том смонтирован `:ro`, `file_server` читает живые файлы) — рестарт не нужен.
- Конфиг сервера — в `/root/chat-server/` (`Caddyfile`, `docker-compose.yml`, бэкапы `*.bak`); контейнеры — `chat-server-caddy-1` (порты 80/443) и `chat-server-app-1` (бот, 8787). Для обновления контента их трогать не нужно; рестарт Caddy (`docker compose restart caddy`) нужен лишь при правке `Caddyfile` или для перезапуска выпуска TLS.
- Любые секреты (ключ OpenRouter, доступ к proxy, системные промпты ботов) живут только на сервере в `.env` и в `private-neuro-slop` — в этот публичный репозиторий и в команды деплоя они не попадают.

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
