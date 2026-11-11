import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const isEssay = (post: Post) => Boolean(post.data.title);
export const isScribble = (post: Post) => !isEssay(post);

/** Turns a (Malayalam or English) title into a URL segment, keeping Unicode letters and marks. */
export function slugify(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '') // zero-width joiners used in Malayalam chillu forms
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
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
