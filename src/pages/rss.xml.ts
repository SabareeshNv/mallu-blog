import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { excerpt, getSortedPosts, isEssay, postUrl } from '@/lib/content';
import { SITE } from '@/config/site';

/** A feed of every essay and scribble, newest first, for feed readers and search engines. */
export async function GET(context: APIContext) {
  const posts = await getSortedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    customData: `<language>${SITE.postLang}</language>`,
    items: posts.map((post) => ({
      title: isEssay(post) ? post.data.title! : excerpt(post, 36),
      description: post.data.summary ?? excerpt(post, 300),
      pubDate: post.data.date,
      link: postUrl(post),
      categories: [isEssay(post) ? 'Essay' : 'Scribble', ...post.data.tags],
    })),
  });
}
