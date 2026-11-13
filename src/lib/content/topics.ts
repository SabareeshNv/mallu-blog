import { topicPath } from '@/config/routes';
import { SITE } from '@/config/site';
import { getSortedPosts } from './posts';
import { slugify } from './slug';
import type { Post } from './types';

/** A topic: a tag used by at least one post, with the posts that carry it (newest first). */
export interface Topic {
  name: string;
  slug: string;
  posts: Post[];
}

export const topicUrl = (topic: Pick<Topic, 'slug'>) => topicPath(topic.slug);

/** The topics of one post, in the order they were written. */
export function postTopics(post: Post): Pick<Topic, 'name' | 'slug'>[] {
  const seen = new Set<string>();
  return post.data.tags.flatMap((name) => {
    const slug = slugify(name);
    if (!slug || seen.has(slug)) return [];
    seen.add(slug);
    return [{ name, slug }];
  });
}

/** Every topic, most used first. Tags that differ only in case or punctuation are one topic. */
export async function getTopics(): Promise<Topic[]> {
  const bySlug = new Map<string, Topic>();
  for (const post of await getSortedPosts()) {
    for (const tag of post.data.tags) {
      const slug = slugify(tag);
      if (!slug)
        throw new Error(`The tag "${tag}" in "${post.id}" has no letters or digits, so it cannot become a URL.`);
      const topic = bySlug.get(slug) ?? { name: tag, slug, posts: [] };
      if (!topic.posts.includes(post)) topic.posts.push(post);
      bySlug.set(slug, topic);
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, SITE.postLang),
  );
}

/**
 * What "Keep reading" lists after an essay: posts that share its topics first, then the newest other posts to fill the
 * list. So it is never empty, even for an essay with no topics.
 */
export async function getKeepReadingPosts(post: Post, limit = SITE.relatedCount): Promise<Post[]> {
  const related = await getRelatedPosts(post, limit);
  if (related.length >= limit) return related;
  const have = new Set([post.id, ...related.map((other) => other.id)]);
  const recent = (await getSortedPosts()).filter((other) => !have.has(other.id));
  return [...related, ...recent].slice(0, limit);
}

/** Other posts that share topics with `post`: the most shared topics first, then the newest. */
export async function getRelatedPosts(post: Post, limit = SITE.relatedCount): Promise<Post[]> {
  const mine = new Set(postTopics(post).map((topic) => topic.slug));
  if (mine.size === 0) return [];
  const scored = (await getSortedPosts())
    .filter((other) => other.id !== post.id)
    .map((other) => ({ other, shared: postTopics(other).filter((topic) => mine.has(topic.slug)).length }))
    .filter(({ shared }) => shared > 0);
  // getSortedPosts is newest first, and Array.sort is stable, so ties stay newest first.
  return scored
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ other }) => other);
}
