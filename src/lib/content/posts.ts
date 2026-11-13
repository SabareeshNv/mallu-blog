import { getCollection } from 'astro:content';
import { SITE } from '@/config/site';
import { essayPath, feedPagePath, scribblePath } from '@/config/routes';
import { isEssay, isScribble, postKind } from './kind';
import { postSlug } from './slug';
import type { Post, PostEntry } from './types';

/** The canonical URL path of a post's own page. */
export const postUrl = (post: Post) => (isEssay(post) ? essayPath(postSlug(post)) : scribblePath(postSlug(post)));

/** The DOM id a post has when it appears in a list (the target of its permalink). */
export const postAnchor = (post: Post) => `${postKind(post)}-${postSlug(post)}`;

/** Where a post sits in the home feed, so a link can lead to it in context. */
export const streamUrl = (entry: PostEntry) => `${feedPagePath(entry.feedPage)}#${postAnchor(entry.post)}`;

/** All published posts, newest first. Drafts are included only while developing. */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const getEssays = async () => (await getSortedPosts()).filter(isEssay);
export const getScribbles = async () => (await getSortedPosts()).filter(isScribble);

/** Every post with its feed page, newest first. */
export async function getPostEntries(): Promise<PostEntry[]> {
  const posts = await getSortedPosts();
  return posts.map((post, i) => ({
    post,
    feedPage: Math.floor(i / SITE.feedPageSize) + 1,
  }));
}

/** Entries for the essay pages. Stops the build if two essays would share an address. */
export async function getEssayEntries(): Promise<PostEntry[]> {
  const entries = (await getPostEntries()).filter(({ post }) => isEssay(post));
  const seen = new Map<string, string>();
  for (const { post } of entries) {
    const slug = postSlug(post);
    if (seen.has(slug)) {
      throw new Error(
        `Essays "${seen.get(slug)}" and "${post.id}" share the URL ${essayPath(slug)}. Add a unique "slug" to one of them.`,
      );
    }
    seen.set(slug, post.id);
  }
  return entries;
}

/** Entries for the scribble pages. */
export async function getScribbleEntries(): Promise<PostEntry[]> {
  return (await getPostEntries()).filter(({ post }) => isScribble(post));
}

/** The newest scribbles other than `exceptId`. */
export async function getRecentScribbles(exceptId: string, limit = SITE.moreScribblesCount): Promise<Post[]> {
  return (await getScribbles()).filter((post) => post.id !== exceptId).slice(0, limit);
}
