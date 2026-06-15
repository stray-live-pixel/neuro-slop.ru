// Универсальные подписи для разбора любого источника.
//
// Раздел /transcripts/ исторически строился вокруг YouTube-видео, но разбирать можно
// что угодно: видео, подкаст, статью или сводный анализ нескольких материалов. Чтобы
// страница, карточка и фильтр говорили о источнике корректно («Слушать подкаст»,
// «Читать статью», «Открыть ключевую ссылку»), все формулировки собраны здесь и
// выводятся из одного поля `video.kind` (см. content.config.ts).

import { youtubeId } from './video';

export type SourceKind = 'video' | 'podcast' | 'article' | 'analysis' | 'other';

export interface SourceInput {
  url: string;
  kind?: SourceKind;
  platform?: 'youtube' | 'other';
}

export interface SourceLabels {
  kind: SourceKind;
  isYouTube: boolean;
  /** Имеет ли смысл встроенный плеер с перемоткой по тайм-кодам (видео/аудио). */
  seekable: boolean;
  /** CTA на баннере-источнике в шапке статьи. */
  play: string;
  /** aria-label кнопки воспроизведения/перехода. */
  playAria: string;
  /** Иконка в кружке баннера и в бейдже типа. */
  icon: string;
  /** Ссылка на источник в подвале статьи. */
  sourceLink: string;
  /** Подпись даты публикации источника (в шапке и на карточке). */
  dateLabel: string;
  /** Заголовок блока оценок. */
  ratingsTitle: string;
  /** Подпись блока «Главы» (если используется). */
  chaptersLabel: string;
  /** Подсказка блока цитат. */
  quotesHint: string;
  /** Подсказка блок-схемы. */
  flowchartHint: string;
}

/** Короткий бейдж типа источника для карточек и фильтра. */
export interface KindBadge {
  kind: SourceKind;
  label: string;
  icon: string;
}

const BADGES: Record<SourceKind, Omit<KindBadge, 'kind'>> = {
  video: { label: 'Видео', icon: 'play' },
  podcast: { label: 'Подкаст', icon: 'mic' },
  article: { label: 'Статья', icon: 'newspaper' },
  analysis: { label: 'Разбор', icon: 'scroll-text' },
  other: { label: 'Источник', icon: 'link' },
};

/** Порядок типов в фильтре раздела. */
export const SOURCE_KINDS: SourceKind[] = ['video', 'podcast', 'article', 'analysis', 'other'];

export function kindBadge(kind: SourceKind): KindBadge {
  return { kind, ...BADGES[kind] };
}

/** Явно заданный `kind`, иначе вывод по платформе/ссылке. */
export function resolveKind(src: SourceInput): SourceKind {
  if (src.kind) return src.kind;
  return youtubeId(src.url) || src.platform === 'youtube' ? 'video' : 'other';
}

export function sourceLabels(src: SourceInput): SourceLabels {
  const isYouTube = !!youtubeId(src.url);
  const kind = resolveKind(src);
  const seekable = kind === 'video' || kind === 'podcast';

  switch (kind) {
    case 'podcast':
      return {
        kind,
        isYouTube,
        seekable,
        play: 'Слушать подкаст',
        playAria: 'Слушать подкаст',
        icon: 'mic',
        sourceLink: 'Слушать подкаст-источник',
        dateLabel: 'Подкаст',
        ratingsTitle: 'Оценка выпуска',
        chaptersLabel: 'Главы выпуска — нажми, чтобы перейти к моменту',
        quotesHint: 'Сильные фразы из выпуска — нажми тайм-код, чтобы услышать в оригинале',
        flowchartHint: 'Как устроена логика выпуска — пройди по шагам',
      };
    case 'article':
      return {
        kind,
        isYouTube,
        seekable,
        play: 'Читать статью',
        playAria: 'Открыть статью',
        icon: 'newspaper',
        sourceLink: 'Открыть статью-источник',
        dateLabel: 'Оригинал',
        ratingsTitle: 'Оценка материала',
        chaptersLabel: 'Разделы материала',
        quotesHint: 'Сильные цитаты из материала',
        flowchartHint: 'Как устроена логика материала — пройди по шагам',
      };
    case 'analysis':
      return {
        kind,
        isYouTube,
        seekable,
        play: 'Открыть источник',
        playAria: 'Открыть источник',
        icon: 'scroll-text',
        sourceLink: 'Открыть источник',
        dateLabel: 'Источник',
        ratingsTitle: 'Оценка материала',
        chaptersLabel: 'Структура материала',
        quotesHint: 'Сильные цитаты из материала',
        flowchartHint: 'Как устроена логика разбора — пройди по шагам',
      };
    case 'other':
      return {
        kind,
        isYouTube,
        seekable,
        play: 'Открыть ключевую ссылку',
        playAria: 'Открыть ссылку',
        icon: 'link',
        sourceLink: 'Открыть источник',
        dateLabel: 'Источник',
        ratingsTitle: 'Оценка материала',
        chaptersLabel: 'Ключевые моменты',
        quotesHint: 'Сильные цитаты из материала',
        flowchartHint: 'Как устроена логика материала — пройди по шагам',
      };
    case 'video':
    default:
      return {
        kind: 'video',
        isYouTube,
        seekable: true,
        play: isYouTube ? 'Смотреть на YouTube' : 'Открыть видео',
        playAria: 'Воспроизвести видео',
        icon: 'play',
        sourceLink: 'Смотреть видео-источник',
        dateLabel: 'Видео',
        ratingsTitle: 'Оценка видео',
        chaptersLabel: 'Главы видео — нажми, чтобы перейти к моменту',
        quotesHint: 'Сильные фразы из видео — нажми тайм-код, чтобы услышать в оригинале',
        flowchartHint: 'Как устроена аргументация видео — пройди по шагам',
      };
  }
}
