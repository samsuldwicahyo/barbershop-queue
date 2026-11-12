/**
 * Format date to YYYY-MM-DD
 */
export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse time string (HH:MM) to minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate time range
 */
export function isValidTimeRange(openTime: string, closeTime: string): boolean {
  return timeToMinutes(openTime) < timeToMinutes(closeTime);
}

/**
 * cn - className merger (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}