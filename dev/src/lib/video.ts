// Утилиты для работы с видео-источником расшифровок.

/** Достаёт 11-символьный YouTube-id из любой формы ссылки. null — если не YouTube. */
export function youtubeId(url: string): string | null {
  return url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? null;
}

/** Секунды → «12:34» или «1:02:03». */
export function formatTimecode(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

/** Ссылка на видео с переходом к моменту t (секунда). Работает и как fallback без JS. */
export function videoTimeUrl(url: string, t: number): string {
  const sec = Math.max(0, Math.floor(t));
  const id = youtubeId(url);
  if (id) return `https://www.youtube.com/watch?v=${id}&t=${sec}s`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${sec}s`;
}

/** Секунды → ISO 8601 длительность (PT1H2M3S) для schema.org. */
export function isoDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${sec || (!h && !m) ? `${sec}S` : ''}`;
}
