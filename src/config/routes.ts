/**
 * Every URL the site links to or generates, in one place.
 * To rename a section, change it here and the links, the navigation and the sitemap follow.
 */
export const ROUTES = {
  home: '/',
  essays: '/essays/',
  scribbles: '/scribbles/',
  archive: '/archive/',
  privacy: '/privacy/',
  contentPolicy: '/content-policy/',
  rss: '/rss.xml',
} as const;

/** Address of an essay's own page. The slug is used as written (it may contain Malayalam). */
export const essayPath = (slug: string) => `/essay/${slug}/`;

/** Address of a scribble's own page. */
export const scribblePath = (slug: string) => `/scribble/${slug}/`;

/** Address of page `page` of the home feed (page 1 is the home page itself). */
export const feedPagePath = (page: number) => (page === 1 ? ROUTES.home : `/${page}/`);
