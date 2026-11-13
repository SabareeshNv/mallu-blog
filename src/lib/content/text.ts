import { graphemes } from '@/lib/graphemes';
import type { Post } from './types';

/** A short plain-text excerpt of a post's Markdown body, cut between Malayalam letters, never inside one. */
export function excerpt(post: Post, length = 90): string {
  const text = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*+\s]+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return shorten(text, length);
}

/** Cuts text to `length` letters (Malayalam letters are never split), adding "…" when something was cut. */
export function shorten(text: string, length: number): string {
  const units = Array.from(graphemes.segment(text), (part) => part.segment);
  return units.length > length ? units.slice(0, length).join('').trimEnd() + '…' : text;
}

/**
 * The short description of a post: an essay's own `summary` when it has one, otherwise an excerpt of its text.
 * (An excerpt is cut to `length`; a summary is used as written, and the page decides how much of it to show.)
 */
export const postSummary = (post: Post, length = 90): string => post.data.summary ?? excerpt(post, length);

/** The page description for search results and shares: the summary or the start of the text, at most 160 letters. */
export const postDescription = (post: Post, fallbackLength = 110): string =>
  post.data.summary ? shorten(post.data.summary, 160) : excerpt(post, fallbackLength);

/** The date an essay was last revised, when that is later than the day it was written; otherwise undefined. */
export function updatedDate(post: Post): Date | undefined {
  const { date, updated } = post.data;
  return updated && updated.toISOString().slice(0, 10) > date.toISOString().slice(0, 10) ? updated : undefined;
}

/** Rough reading time in minutes (Malayalam reads a little slower than English). */
export function readingMinutes(post: Post, wordsPerMinute = 160): number {
  const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
