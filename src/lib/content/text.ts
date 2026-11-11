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
  const units = Array.from(graphemes.segment(text), (part) => part.segment);
  return units.length > length ? units.slice(0, length).join('').trimEnd() + '…' : text;
}

/** Rough reading time in minutes (Malayalam reads a little slower than English). */
export function readingMinutes(post: Post, wordsPerMinute = 160): number {
  const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
