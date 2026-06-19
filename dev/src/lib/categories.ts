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

// Раздел «Разборы» — отдельная коллекция (см. content.config.ts), поэтому живёт
// рядом с категориями, но не входит в CATEGORIES. URL остаётся /transcripts/ (SEO),
// меняется только подпись: разбираем не только видео, но и подкасты, статьи и
// аналитические сводки.
export const TRANSCRIPTS_SECTION = {
  slug: 'transcripts',
  label: 'Разборы',
  icon: 'scroll-text',
  description: 'Видео, подкасты и статьи, разобранные по полочкам: суть, инсайты, советы и тест на усвоение',
  gradient: 'linear-gradient(135deg, #ff9004, #c959dd)',
} as const;

// Раздел «Чаты» — отдельная коллекция (chats, см. content.config.ts): живые
// ИИ-боты, с которыми можно поговорить прямо в браузере. Шуточные эксперименты.
export const CHATS_SECTION = {
  slug: 'chats',
  label: 'Чаты',
  icon: 'bot',
  description: 'Живые ИИ-боты, с которыми можно поговорить прямо в браузере. Шуточные эксперименты, а не советы',
  gradient: 'linear-gradient(135deg, #0894ff, #ff2e54)',
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
  { ...CHATS_SECTION, href: '/chats/' },
];

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Оценка 5 — особая: красим фирменным градиентом темы
export function isTopRating(value: number): boolean {
  return value >= 5;
}

// Сплошной цвет оценки по порогам (без округления):
// ≥5 — золото (на деле для 5 берём градиент), ≥4 — зелёный, ≥3 — жёлтый, иначе красный
export function ratingColor(value: number): string {
  if (value >= 5) return '#f0b100'; // золото (фолбэк, если градиент не применить)
  if (value >= 4) return '#22c55e'; // зелёный
  if (value >= 3) return '#facc15'; // жёлтый
  return '#ef4444'; // красный
}

// CSS-фон шкалы оценки: для 5 — фирменный градиент, иначе сплошной цвет
export function ratingFill(value: number): string {
  return isTopRating(value) ? 'var(--gradient-brand)' : ratingColor(value);
}
