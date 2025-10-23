export const dateFormatter = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diff = (date - now) / 1000;
  const absDiff = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto' });

  if (absDiff < 60) return rtf.format(Math.round(diff), 'second');
  if (absDiff < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (absDiff < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (absDiff < 604800) return rtf.format(Math.round(diff / 86400), 'day');
  return date.toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
  });
};
