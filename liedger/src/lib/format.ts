/** Human-friendly relative time, e.g. "2h ago", "3d ago". */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(ts).toLocaleDateString();
}

export function channelLabel(channel: string): string {
  switch (channel) {
    case 'in_person':
      return 'In person';
    case 'text':
      return 'Text';
    case 'call':
      return 'Call';
    case 'email':
      return 'Email';
    case 'social':
      return 'Social';
    default:
      return 'Other';
  }
}

/** Deterministic color from a seed string, for generated avatars. */
export function seedColor(seed: string | null | undefined): string {
  const palette = ['#7C5CFF', '#3DD68C', '#F5B14C', '#FF6B6B', '#4CC9F0', '#F072B6'];
  if (!seed) return palette[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
