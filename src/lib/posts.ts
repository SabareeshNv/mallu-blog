import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const isEssay = (post: Post) => Boolean(post.data.title);
export const isScribble = (post: Post) => !isEssay(post);

const graphemes = new Intl.Segmenter('ml', { granularity: 'grapheme' });

/** Longest URL segment, in UTF-8 bytes. Malayalam letters take 3 bytes each, and file names are limited to 255 bytes. */
const MAX_SLUG_BYTES = 180;
const byteLength = (text: string) => new TextEncoder().encode(text).length;

/**
 * Turns a (Malayalam or English) title into a URL segment, keeping Unicode letters and marks.
 * Long titles are shortened at a word boundary, so very long titles still produce a valid address.
 */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width joiners used in Malayalam chillu forms
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  if (byteLength(slug) <= MAX_SLUG_BYTES) return slug;

  // Keep whole words while they fit.
  const words = slug.split('-');
  let result = '';
  for (const word of words) {
    const next = result ? `${result}-${word}` : word;
    if (byteLength(next) > MAX_SLUG_BYTES) break;
    result = next;
  }
  if (result) return result;

  // A single enormous word: cut it between grapheme clusters, never inside one.
  result = '';
  for (const { segment } of graphemes.segment(slug)) {
    if (byteLength(result + segment) > MAX_SLUG_BYTES) break;
    result += segment;
  }
  return result;
}

/** The URL segment used for a post. */
export function postSlug(post: Post): string {
  if (isEssay(post)) return post.data.slug ?? slugify(post.data.title!);
  return post.id;
}

/** The canonical URL of a post. */
export function postUrl(post: Post): string {
  return `/${isEssay(post) ? 'essay' : 'scribble'}/${postSlug(post)}/`;
}

/** DOM id for a post when it appears in a list. */
export const postAnchor = (post: Post) => `${isEssay(post) ? 'essay' : 'scribble'}-${postSlug(post)}`;

/** All published posts, newest first. */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface Group<K> {
  key: K;
  label: string;
  posts: Post[];
}

/** Groups already-sorted posts by a key, preserving order. */
function groupBy<K extends string>(posts: Post[], keyOf: (p: Post) => K, labelOf: (p: Post) => string): Group<K>[] {
  const groups: Group<K>[] = [];
  for (const post of posts) {
    const key = keyOf(post);
    const last = groups.at(-1);
    if (last && last.key === key) last.posts.push(post);
    else groups.push({ key, label: labelOf(post), posts: [post] });
  }
  return groups;
}

const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const groupByMonth = (posts: Post[]) =>
  groupBy(
    posts,
    (p) => p.data.date.toISOString().slice(0, 7),
    (p) => monthFormat.format(p.data.date),
  );

export const groupByYear = (posts: Post[]) =>
  groupBy(
    posts,
    (p) => String(p.data.date.getUTCFullYear()),
    (p) => String(p.data.date.getUTCFullYear()),
  );

const segmenter = new Intl.Segmenter('ml', { granularity: 'grapheme' });

/** A short plain-text excerpt of a post's Markdown body. */
export function excerpt(post: Post, length = 90): string {
  const text = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*+\s]+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Segment by grapheme so Malayalam conjuncts are never cut in half.
  const graphemes = Array.from(segmenter.segment(text), (s) => s.segment);
  return graphemes.length > length ? graphemes.slice(0, length).join('').trimEnd() + '…' : text;
}

/** Rough reading time in minutes (Malayalam reads a little slower than English). */
export function readingMinutes(post: Post, wordsPerMinute = 160): number {
  const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
