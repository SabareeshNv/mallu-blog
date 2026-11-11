import type { Post, PostKind } from './types';

/** A post with a title is an essay; a post without one is a scribble. */
export const isEssay = (post: Post) => Boolean(post.data.title);
export const isScribble = (post: Post) => !isEssay(post);
export const postKind = (post: Post): PostKind => (isEssay(post) ? 'essay' : 'scribble');
