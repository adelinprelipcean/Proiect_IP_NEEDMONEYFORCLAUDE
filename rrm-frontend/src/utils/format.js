const dateTimeFormat = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('ro-RO', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * @param {number} value
 * @return {string} ex. "120,00 lei"
 */
export function formatPrice(value) {
  return `${Number(value).toFixed(2).replace('.', ',')} lei`;
}

/**
 * @param {string} value data ISO din API
 * @return {string} ex. "25.11.2026, 10:00"
 */
export function formatDateTime(value) {
  return dateTimeFormat.format(new Date(value));
}

/**
 * @param {string} start
 * @param {string} end
 * @return {string} ex. "25.11.2026, 10:00 - 12:00"
 */
export function formatInterval(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${dateTimeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }
  return `${dateTimeFormat.format(startDate)} - ${dateTimeFormat.format(endDate)}`;
}
