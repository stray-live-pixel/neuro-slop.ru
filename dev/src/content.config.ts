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

    // Источник
    video: z.object({
      url: z.string(),
      title: z.string().optional(), // исходное название видео
      channel: z.string().optional(),
      duration: z.string().optional(), // напр. «1 ч 02 мин»
      platform: z.enum(['youtube', 'other']).default('youtube'),
    }),
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

    // Теги из каталога src/lib/tags.ts (новые добавлять туда же)
    tags: z.array(z.string()).min(1),

    // До 5 инсайтов — то, что переворачивает отношение к теме
    insights: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .max(5)
      .optional(),

    // До 5 практических советов для саморазвития
    tips: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .max(5)
      .optional(),

    // Логическая блок-схема повествования видео
    flowchart: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string().optional(),
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

    // Похожие статьи — id (слаги) других расшифровок
    related: z.array(z.string()).optional(),

    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, transcripts };
