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

// Раздел «Расшифровки» — отдельная коллекция (см. content.config.ts),
// поэтому живёт рядом с категориями, но не входит в CATEGORIES.
export const TRANSCRIPTS_SECTION = {
  slug: 'transcripts',
  label: 'Расшифровки',
  icon: 'scroll-text',
  description: 'Видео, разобранные по полочкам: суть, инсайты, советы и тест на усвоение',
  gradient: 'linear-gradient(135deg, #ff9004, #c959dd)',
} as const;

// Все разделы сайта — для плиток на главной, фильтра на /posts/ и навигации.
export const SECTIONS = [
  ...Object.entries(CATEGORIES).map(([slug, c]) => ({
    slug,
    label: c.label,
    icon: c.icon,
    description: c.description,
    gradient: c.gradient,
    href: `/category/${slug}/`,
  })),
  { ...TRANSCRIPTS_SECTION, href: '/transcripts/' },
];

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Цвет оценки: 5 — золото, 4 — зелёный, 3 — жёлтый, 2/1/0 — красный
export function ratingColor(value: number): string {
  const v = Math.round(value);
  if (v >= 5) return '#f0b100'; // золото
  if (v === 4) return '#22c55e'; // зелёный
  if (v === 3) return '#facc15'; // жёлтый
  return '#ef4444'; // красный
}
