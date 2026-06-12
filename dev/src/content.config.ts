import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['news', 'games']),
    cover: z.string().optional(),
    // Поля записей-игр (category: games)
    model: z.string().optional(),
    timeSpent: z.string().optional(),
    gameUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
