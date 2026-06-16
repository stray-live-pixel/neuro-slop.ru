import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['news', 'games', 'prompts']),
    cover: z.string().optional(),
    // Поля записей-игр (category: games)
    model: z.string().optional(),
    timeSpent: z.string().optional(),
    gameUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Расшифровки видео — каждая статья лежит в своей папке:
//   src/content/transcripts/<slug>/index.md   — структурированный разбор (этот файл)
//   src/content/transcripts/<slug>/transcript.md — полная расшифровка (не публикуется)
// id статьи = имя папки (см. generateId), URL — /transcripts/<slug>/.
const transcripts = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/transcripts',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    // Осмысленный заголовок — польза и ёмкость, а не кликбейт из названия видео
    title: z.string(),
    // Краткий подзаголовок / meta-описание для соцсетей
    description: z.string(),
    // TLDR: ровно 2 коротких предложения — суть видео с ходу
    tldr: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),

    // Голосовая выжимка (только новые статьи): короткая озвучка самого ценного из разбора
    // (Yandex SpeechKit). mp3 лежит в dev/public/audio/<slug>.mp3. На странице — плеер +
    // свёрнутый текст (script). Генерируется в приватном пайплайне (см. tts/synthesize.py).
    audio: z
      .object({
        src: z.string(), // путь к mp3, напр. /audio/<slug>.mp3
        duration: z.string().optional(), // подпись «1:47»
        durationSeconds: z.number().int().positive().optional(),
        voice: z.string().optional(), // голос синтеза, напр. alena
        script: z.string().optional(), // текст выжимки (показывается под cut)
      })
      .optional(),

    // Блок «Объясни проще» — разные линзы на одну суть (показываются списком):
    // Объяснение сути простым языком — для неподготовленного читателя
    plain: z.string().optional(),
    // Объяснение «на пальцах», как для ребёнка
    forKids: z.string().optional(),
    // Бытовая аналогия — «это как…»
    analogy: z.string().optional(),
    // Зачем это читателю / почему тема важна
    whyImportant: z.string().optional(),
    // Плотная выжимка для подготовленных — «для тех, кто в теме»
    forExperts: z.string().optional(),

    // Источник разбора. Поле исторически называется `video`, но разбирать можно
    // что угодно: видео, подкаст, статью или сводный анализ. `kind` управляет всеми
    // подписями на странице (CTA, заголовки блоков, даты). Если не задан — выводится:
    // YouTube/`platform: youtube` → 'video', иначе 'other'. См. src/lib/source.ts.
    video: z.object({
      url: z.string(),
      title: z.string().optional(), // исходное название источника
      channel: z.string().optional(), // канал / автор / издание / ведущие
      duration: z.string().optional(), // напр. «1 ч 02 мин» (для видео/аудио)
      durationSeconds: z.number().int().positive().optional(), // длительность в секундах — для ISO 8601 в JSON-LD
      published: z.coerce.date().optional(), // дата публикации источника
      platform: z.enum(['youtube', 'other']).default('youtube'),
      // Тип источника — определяет формулировки на странице (CTA, заголовки, даты).
      kind: z.enum(['video', 'podcast', 'article', 'analysis', 'other']).optional(),
    }),

    // Тайм-коды («главы») видео: t — секунда начала, title — о чём фрагмент.
    // Клик по главе проигрывает видео с этого момента прямо на странице.
    chapters: z
      .array(
        z.object({
          t: z.number().int().min(0), // секунда начала
          title: z.string(),
          detail: z.string().optional(),
        })
      )
      .optional(),

    // Ключевые цитаты — дословные сильные фразы из видео. t (секунда) опционален:
    // если задан, рядом появляется кнопка перехода к моменту в видео.
    quotes: z
      .array(
        z.object({
          text: z.string(),
          t: z.number().int().min(0).optional(),
          speaker: z.string().optional(), // кто это сказал (если в видео несколько голосов)
          context: z.string().optional(), // одна фраза контекста — о чём речь
        })
      )
      .max(8)
      .optional(),
    // Ссылка на готовый анализ из соседнего проекта (для воспроизводимости)
    sourceAnalysis: z.string().optional(),

    // Оценки 1–5 по рубрикам (актуальность, содержательность, инновационность, …)
    ratings: z
      .array(
        z.object({
          label: z.string(),
          value: z.number().min(1).max(5),
          note: z.string().optional(),
        })
      )
      .min(1),

    // Для каких профессий материал особенно полезен. score 1–5 — насколько.
    // name — в форме после «Для …» (род. падеж мн. ч.): «предпринимателей», «ML-инженеров».
    // На странице сортируются по score; каждая профессия — cut с обоснованием `why`.
    professions: z
      .array(
        z.object({
          name: z.string(),
          score: z.number().min(1).max(5),
          why: z.string(),
        })
      )
      .optional(),

    // Теги из каталога src/lib/tags.ts (новые добавлять туда же)
    tags: z.array(z.string()).min(1),

    // До 5 инсайтов — то, что переворачивает отношение к теме.
    // t (секунда) опционален — где в видео это прозвучало.
    insights: z
      .array(z.object({ title: z.string(), text: z.string(), t: z.number().int().min(0).optional() }))
      .max(5)
      .optional(),

    // До 10 практических советов для саморазвития.
    // title — императив-суть; в шапке карточки видны мотиваторы: time (сколько займёт)
    // и gain (что это даст). Под cut — text (подробнее как/почему) и steps
    // (детерминированный список конкретных действий: «1. Открой… 2. Набери…»).
    tips: z
      .array(
        z.object({
          title: z.string(),
          text: z.string(),
          time: z.string().optional(), // сколько времени займёт: «2 минуты», «вечер»
          gain: z.string().optional(), // что это даст — выгода простыми словами
          steps: z.array(z.string()).optional(), // пошаговый список действий (под cut)
        })
      )
      .max(10)
      .optional(),

    // Человеческие сценарии применения (user stories): до 10, с разных ролей
    userStories: z
      .array(
        z.object({
          role: z.string(), // «учитель», «предприниматель», «врач»…
          pain: z.string(), // боль/проблема
          want: z.string(), // чего хочет
          gain: z.string(), // как материал статьи помогает
        })
      )
      .max(10)
      .optional(),

    // Логическая блок-схема повествования видео
    flowchart: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string().optional(),
          t: z.number().int().min(0).optional(), // секунда в видео, где этот шаг
          // тип узла раскрашивает шаг: предпосылка → аргумент → пример → вывод
          type: z.enum(['premise', 'argument', 'example', 'conclusion']).optional(),
        })
      )
      .optional(),

    // План внедрения в жизнь (если есть рекомендации)
    plan: z.array(z.object({ step: z.string(), detail: z.string().optional() })).optional(),

    // Тест из 5 вопросов с обратной связью на верный/неверный ответ
    quiz: z
      .array(
        z.object({
          question: z.string(),
          options: z.array(z.string()).min(2),
          answer: z.number().int().min(0), // индекс правильного варианта
          correctText: z.string(),
          wrongText: z.string(),
        })
      )
      .optional(),

    // Словарь терминов простым языком (показывается под cut в конце статьи)
    glossary: z
      .array(z.object({ term: z.string(), definition: z.string() }))
      .optional(),

    // Критический взгляд (только новые статьи): объективно — с какими тезисами можно
    // поспорить, что преувеличено или может быть далеко от правды. Показывается в конце.
    critique: z
      .array(
        z.object({
          point: z.string(), // спорный тезис / что преувеличено
          detail: z.string(), // объективное, полезное пояснение почему
          // ярлык характера претензии (раскрашивает бейдж)
          kind: z
            .enum(['exaggeration', 'disputable', 'oversimplified', 'one-sided', 'outdated'])
            .optional(),
        })
      )
      .max(6)
      .optional(),

    // «Взгляни иначе» (только новые статьи): пища для размышлений — иной угол на тему,
    // применение в смежных областях, потенциал на стыке областей. Показывается в конце.
    thinkDifferent: z
      .array(
        z.object({
          title: z.string(),
          text: z.string(),
          // тип поворота мысли: другой угол / смежная область / на стыке областей
          kind: z.enum(['reframe', 'adjacent', 'intersection']).optional(),
        })
      )
      .max(6)
      .optional(),

    // Похожие статьи — id (слаги) других расшифровок
    related: z.array(z.string()).optional(),

    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, transcripts };
