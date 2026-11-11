import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  href: string;
  /** First path segments that belong to this item, so it is highlighted on its own pages (e.g. a single essay). */
  sections: readonly string[];
}

/** The links in the header. Add, remove or reorder them here. */
export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Home', href: ROUTES.home, sections: [''] },
  { label: 'Essays', href: ROUTES.essays, sections: ['essays', 'essay'] },
  { label: 'Scribbles', href: ROUTES.scribbles, sections: ['scribbles', 'scribble'] },
  { label: 'Archive', href: ROUTES.archive, sections: ['archive'] },
];

/** The links in the footer. */
export const LEGAL_NAV = [
  { label: 'Privacy Policy', href: ROUTES.privacy },
  { label: 'Content Policy', href: ROUTES.contentPolicy },
] as const;

/** Whether `item` is the current section, judged by the first segment of the page's path. */
export function isActiveNavItem(item: NavItem, pathname: string): boolean {
  const segment = pathname.split('/')[1] ?? '';
  // The home feed continues on /2/, /3/ ...; the 404 page's path (/404/) must not count as one of them.
  const isFeedPage = item.href === ROUTES.home && /^\d+$/.test(segment) && segment !== '404';
  return item.sections.includes(segment) || isFeedPage;
}
