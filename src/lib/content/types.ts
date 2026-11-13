import type { CollectionEntry } from 'astro:content';

/** One entry of the `posts` collection: an essay (has a title) or a scribble (has none). */
export type Post = CollectionEntry<'posts'>;

export type PostKind = 'essay' | 'scribble';

/** A post with where it sits in the home feed. */
export interface PostEntry {
  post: Post;
  /** The home-feed page (1, 2, ...) this post appears on. */
  feedPage: number;
}

/** Posts grouped under a heading (a month or a year). */
export interface Group {
  key: string;
  label: string;
  posts: Post[];
}
