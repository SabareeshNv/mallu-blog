/** Describes a page that is an essay or a scribble, so it can be marked up as an article. */
export interface ArticleMeta {
  section: 'essay' | 'scribble';
  publishedTime: Date;
  /** When the post was last revised (an essay's `updated`). */
  modifiedTime?: Date;
  /** The post's topics; written as keywords in the structured data. */
  tags?: string[];
}
