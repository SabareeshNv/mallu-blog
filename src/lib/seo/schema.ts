/**
 * schema.org structured data (JSON-LD), so search engines understand what each page is.
 * Pure functions: they take plain values and return plain objects.
 */
import { SITE } from '@/config/site';
import { ROUTES } from '@/config/routes';

export type Schema = Record<string, unknown>;

const publisherOf = (site: URL): Schema => ({
  '@type': 'Organization',
  name: SITE.title,
  url: site.href,
  logo: { '@type': 'ImageObject', url: new URL('/apple-touch-icon.png', site).href },
});

/** The home page: the website, and the blog it contains. */
export function siteSchemas(site: URL): Schema[] {
  const publisher = publisherOf(site);
  return [
    {
      '@type': 'WebSite',
      '@id': `${site.href}#website`,
      url: site.href,
      name: SITE.title,
      description: SITE.description,
      inLanguage: ['en', SITE.postLang],
      publisher,
    },
    {
      '@type': 'Blog',
      '@id': `${site.href}#blog`,
      url: site.href,
      name: SITE.title,
      description: SITE.description,
      inLanguage: SITE.postLang,
      isPartOf: { '@id': `${site.href}#website` },
      publisher,
    },
  ];
}

export interface PostSchemaInput {
  site: URL;
  canonical: URL;
  headline: string;
  description: string;
  imageUrl: URL;
  publishedTime?: Date;
  modifiedTime?: Date;
  section: 'essay' | 'scribble';
  tags?: string[];
}

/** An essay or scribble: the post itself, and its breadcrumb trail (Home > Essays > title). */
export function postSchemas({
  site,
  canonical,
  headline,
  description,
  imageUrl,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: PostSchemaInput): Schema[] {
  const published = publishedTime?.toISOString();
  const sectionName = section === 'essay' ? 'Essays' : 'Scribbles';
  const sectionUrl = new URL(section === 'essay' ? ROUTES.essays : ROUTES.scribbles, site).href;
  return [
    {
      '@type': 'BlogPosting',
      headline,
      description,
      url: canonical.href,
      mainEntityOfPage: canonical.href,
      ...(published && { datePublished: published, dateModified: modifiedTime?.toISOString() ?? published }),
      inLanguage: SITE.postLang,
      ...(tags.length > 0 && { keywords: tags.join(', ') }),
      image: imageUrl.href,
      author: { '@type': 'Organization', name: SITE.author, url: site.href },
      publisher: publisherOf(site),
      isPartOf: { '@id': `${site.href}#blog` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.href },
        { '@type': 'ListItem', position: 2, name: sectionName, item: sectionUrl },
        { '@type': 'ListItem', position: 3, name: headline, item: canonical.href },
      ],
    },
  ];
}

/** The text of the <script type="application/ld+json"> element; "<" is escaped so it can never close the tag. */
export function serializeJsonLd(graph: Schema[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
