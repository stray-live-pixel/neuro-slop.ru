// Каталог тегов расшифровок: slug → человекочитаемая подпись.
// Переиспользуй существующие теги; новые добавляй сюда, а не плоди дубли.
export const TAGS: Record<string, string> = {
  ai: 'ИИ',
  programming: 'Программирование',
  economics: 'Экономика',
  business: 'Бизнес',
  management: 'Менеджмент',
  startups: 'Стартапы',
  finance: 'Финансы',
  career: 'Карьера',
  productivity: 'Продуктивность',
  education: 'Образование',
  science: 'Наука',
  psychology: 'Психология',
  philosophy: 'Философия',
  health: 'Здоровье',
  design: 'Дизайн',
  marketing: 'Маркетинг',
  future: 'Будущее',
  entertainment: 'Развлечения',
};

export function tagLabel(slug: string): string {
  return TAGS[slug] ?? slug;
}
