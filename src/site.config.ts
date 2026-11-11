/**
 * Site-wide settings. Edit these to make the blog your own.
 */
export const SITE = {
  title: 'Margins',
  tagline: 'Ideas, thoughts and feelings — written in Malayalam.',
  author: 'Your Name',
  /** Shown on the Privacy and Content Policy pages. Replace with your own address. */
  contactEmail: 'you@example.com',
  description: 'A personal notebook of essays and scribbles in Malayalam.',
  /** Language of the posts (BCP 47). The UI stays in English. */
  postLang: 'ml',
  /** Maximum number of entries on each page of the home feed. */
  feedPageSize: 30,
  /** Maximum number of entries on each page of the archive. */
  archivePageSize: 30,
} as const;
