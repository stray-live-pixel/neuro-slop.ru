export const CATEGORIES = {
  news: {
    label: 'Новости',
    icon: 'newspaper',
    description: 'Что происходит в мире нейросетей и на этом сайте',
    gradient: 'linear-gradient(135deg, #0894ff, #c959dd)',
  },
  games: {
    label: 'Игры',
    icon: 'gamepad-2',
    description: 'Игры, сгенерированные нейросетями, — играть прямо в браузере',
    gradient: 'linear-gradient(135deg, #ff2e54, #ff9004)',
  },
  prompts: {
    label: 'Промпты',
    icon: 'sparkles',
    description: 'Промпты, которые я использую в работе над сайтом и экспериментами',
    gradient: 'linear-gradient(135deg, #c959dd, #ff2e54)',
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
