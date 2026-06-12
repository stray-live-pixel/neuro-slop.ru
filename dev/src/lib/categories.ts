export const CATEGORIES = {
  experiments: {
    label: 'Эксперименты',
    emoji: '🧪',
    description: 'Пробую модели и инструменты в деле',
  },
  articles: {
    label: 'Статьи',
    emoji: '📚',
    description: 'Разборы и переработанные материалы',
  },
  prompts: {
    label: 'Промпты',
    emoji: '✨',
    description: 'Рабочие промпты и приёмы',
  },
  notes: {
    label: 'Наблюдения',
    emoji: '👀',
    description: 'Заметки и советы из практики',
  },
  news: {
    label: 'Новости',
    emoji: '📰',
    description: 'Что происходит в мире нейросетей',
  },
  comparisons: {
    label: 'Сравнения',
    emoji: '⚖️',
    description: 'Модели лицом к лицу',
  },
  games: {
    label: 'Игры',
    emoji: '🎮',
    description: 'Игры, сгенерированные нейросетями, — играть прямо в браузере',
  },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
