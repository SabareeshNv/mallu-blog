/** Date and number formatting for the interface (the interface is English; posts are Malayalam). */

const date = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options });

const longDate = date({ day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = date({ day: 'numeric', month: 'short' });
const monthName = date({ month: 'long' });
const monthAndYear = date({ month: 'long', year: 'numeric' });

/** "12 March 2026" ("long") or "12 Mar" ("short"). */
export const formatDate = (value: Date, style: 'long' | 'short' = 'long') =>
  (style === 'long' ? longDate : shortDate).format(value);

/** "March" */
export const formatMonthName = (value: Date) => monthName.format(value);

/** "March 2026" */
export const formatMonthAndYear = (value: Date) => monthAndYear.format(value);

/** "2026-03-12", for the datetime attribute of <time>. */
export const isoDate = (value: Date) => value.toISOString().slice(0, 10);

/** "1 essay", "5 essays"; pass `plural` for irregular words ("1 entry", "5 entries"). */
export const countOf = (n: number, singular: string, plural = `${singular}s`) => `${n} ${n === 1 ? singular : plural}`;
