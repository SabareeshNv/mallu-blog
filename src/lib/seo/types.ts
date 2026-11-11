/** Describes a page that is an essay or a scribble, so it can be marked up as an article. */
export interface ArticleMeta {
  section: 'essay' | 'scribble';
  publishedTime: Date;
}
