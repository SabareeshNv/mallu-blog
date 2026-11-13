import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * One collection holds both kinds of post:
 *  - an Essay has a `title`
 *  - a Scribble has no `title`
 */
const posts = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,markdown}',
    base: './src/content/posts',
    // Keep the original file name as the id, so a scribble's URL is /scribble/<file-name>/
    generateId: ({ entry }) => entry.replace(/\.(md|markdown)$/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1).optional(),
        date: z.coerce.date(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        /** Optional URL override for an essay. Defaults to a slug made from the title. */
        slug: z.string().optional(),
        /** Optional topics, e.g. tags: [ഓർമ്മ, യാത്ര]. Each topic gets its own page under /topics/. */
        tags: z.array(z.string().trim().min(1)).default([]),
        draft: z.boolean().default(false),
        /** Essays only: a short description. Shown in lists, in search results and in the page description. */
        summary: z.string().trim().min(1).optional(),
        /** Essays only: the date of the latest revision. Shown on the essay and sent to search engines as dateModified. */
        updated: z.coerce.date().optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.title && (data.summary || data.updated)) {
          ctx.addIssue({ code: 'custom', message: '"summary" and "updated" are for essays; a scribble has no title.' });
        }
        if (data.updated && data.updated < data.date) {
          ctx.addIssue({ code: 'custom', path: ['updated'], message: '"updated" cannot be earlier than "date".' });
        }
      }),
});

export const collections = { posts };
