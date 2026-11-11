/**
 * Site-wide settings. Edit these to make the blog your own.
 */
export const SITE = {
  title: 'Lone Voice',
  /** The <title> of the home page: short enough to show in full in search results. */
  homeTitle: 'Lone Voice — Essays and notes in Malayalam',
  tagline: 'Essays and short notes in Malayalam on memory, travel, reading and everyday life.',
  /** Byline used in the footer and the Content Policy. */
  author: 'Lone Voice',
  description:
    'Lone Voice is a personal notebook of essays and short notes written in Malayalam — on memory, travel, reading and everyday life.',
  /** Optional e-mail shown on the policy pages. When empty, the first social link is used as the contact. */
  contactEmail: '',
  /** Profiles used as the contact on the policy pages (the first one is shown). Every entry must be a real, working URL. */
  social: [{ label: 'GitHub', href: 'https://github.com/SabareeshNv' }],
  /** Language of the posts (BCP 47). The interface stays in English. */
  postLang: 'ml',
  /** Maximum number of entries on each page of Home, Essays and Scribbles. */
  feedPageSize: 30,
  /** Maximum number of entries on each page of the Archive. */
  archivePageSize: 30,
} as const;
