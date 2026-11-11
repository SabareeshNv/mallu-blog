import { formatMonthAndYear } from '@/lib/format';
import type { Group, Post } from './types';

/** Groups already-sorted posts by a key, preserving order. */
function groupBy(posts: Post[], keyOf: (post: Post) => string, labelOf: (post: Post) => string): Group[] {
  const groups: Group[] = [];
  for (const post of posts) {
    const key = keyOf(post);
    const last = groups.at(-1);
    if (last && last.key === key) last.posts.push(post);
    else groups.push({ key, label: labelOf(post), posts: [post] });
  }
  return groups;
}

/** Newest-first posts grouped by month ("2026-10"), labelled "October 2026". */
export const groupByMonth = (posts: Post[]) =>
  groupBy(
    posts,
    (post) => post.data.date.toISOString().slice(0, 7),
    (post) => formatMonthAndYear(post.data.date),
  );

/** Newest-first posts grouped by year ("2026"). */
export const groupByYear = (posts: Post[]) =>
  groupBy(
    posts,
    (post) => String(post.data.date.getUTCFullYear()),
    (post) => String(post.data.date.getUTCFullYear()),
  );
