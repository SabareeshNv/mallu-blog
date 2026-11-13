# Lone Voice — a Malayalam notebook

A personal blog/microblog built with **Astro 7**, plain modern CSS and vanilla JavaScript.
Posts are written in Malayalam; the interface is in English.

## Commands

| Command           | Action                                  |
| ----------------- | --------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Start the dev server at `localhost:4321` |
| `npm run build`   | Build the static site into `dist/` and create the search index |
| `npm run preview` | Preview the built site                  |
| `npm run check`   | Type-check the project                  |
| `npm run validate`| Type-check, build, then verify the output |
| `npm run format`  | Tidy the code with Prettier             |

## Writing posts

All posts live in one collection: `src/content/posts/`. Copy `_template-scribble.md` to start
(files beginning with `_` are ignored).

```md
---
title: മഴയുടെ ഓർമ്മകൾ        # with a title → Essay   (/essay/<title-slug>/)
date: 2026-10-28             # required
tags: [ഓർമ്മ, പ്രകൃതി]       # optional: topics (each gets a page under /topics/)
cover: ../../assets/images/rain-window.jpg   # optional
coverAlt: Raindrops on a window              # describe the cover for screen readers
slug: mazha                  # optional: custom essay URL instead of the Malayalam title
summary: ഒരു ചെറിയ വിവരണം      # optional, essays only: shown in lists, search results and the page description
updated: 2026-11-02          # optional, essays only: date of the latest revision (not earlier than `date`)
draft: true                  # optional: hidden from production builds
---
```

- **Essay**: has a `title`. Its URL is `/essay/<slug of the title>/`. The feed shows the title as a link, with the cover if there is one.
- **Scribble**: no `title`. Its URL is `/scribble/<file-name>/`. The feed shows the full text and an icon-only permalink
  that opens the scribble's own page. That page has a
  "See it in the stream" link that opens the right feed page, scrolled to that scribble.

- **Summary and updated** (essays only): `summary` replaces the automatic excerpt in the lists, in the page description
  (cut to 160 letters), in the RSS feed and in search; `updated` shows "Updated <date>" beside the reading time
  (only when it is later than `date`) and is sent to search engines as the modified date. A scribble that has either is
  rejected at build time, with a message.
- **Topics**: the optional `tags` list. Every tag gets its own page (`/topics/<tag>/`), and `/topics/` lists them all,
  most used first. On a post's page the topics are links, and an essay ends with a "Keep reading" list of other posts that
  share its topics.
- **Home**: every entry in one timeline grouped by month, newest first. On the Essays page essays are shown two across,
  grouped by year. A long essay shows a thin progress bar under the header as it is read.

Put cover images in `src/assets/images/`. Astro optimises them into responsive WebP at build time.

## Search

Search is [Pagefind](https://pagefind.app): a box in the home page's side column on large screens, and a search bar
above the posts everywhere else (tablets, phones, and the Essays, Scribbles, Archive and Topics pages). The header has no search button. Ctrl/⌘+K or `/` opens it anywhere. It finds Malayalam and English, can be
filtered to essays or scribbles, and loads only when someone searches. The index is built by `npm run build`, so search
works on the built site (`npm run build`, then `npm run preview`), not under `npm run dev`.

## Pages

`/about/` is plain Markdown: edit `src/pages/about.md` to tell readers who writes here. Other text pages (the policies) are
`.astro` files in `src/pages/`; a new Markdown page only needs `layout: '@/layouts/MarkdownLayout.astro'` and a `title`.

## Settings

Edit `src/config/site.ts` to set the site title, tagline, byline, social profiles, an optional contact e-mail
(when empty, the first social profile is used on the policy pages), and the page sizes:

```ts
feedPageSize: 30,     // entries per page on Home, Essays and Scribbles
archivePageSize: 30,  // entries per archive page
```

## Structure

The code is organised so that content, configuration, logic and design each have one place. See
**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the folder map, how a page is built, and a table of "I want to
change X: edit Y" recipes.

```
src/config/      site settings, URLs, navigation        src/styles/     tokens, theme colours, base styles
src/content/     the posts (Markdown)                    src/layouts/    page frames
src/lib/         logic: content, formatting, SEO         src/components/ pieces, grouped by role
src/pages/       routes                                  scripts/        developer tools (verify-build)
```

## Deployment

Set `SITE_URL` in your host's build settings to the public address (for example `https://lonevoice.pages.dev`).
It is used for canonical links and social-preview images. Netlify's `URL` and Cloudflare Pages' `CF_PAGES_URL`
are picked up automatically when `SITE_URL` is not set.

## Search engines and sharing (SEO)

- Every page has a unique `<title>`, description, canonical link and social-preview image (an essay's own cover, or
  the hero photograph); essay and scribble pages are tagged as Malayalam (`og:locale`, `inLanguage`).
- Structured data (JSON-LD): `WebSite` and `Blog` on the home page; `BlogPosting` and `BreadcrumbList` on every essay
  and scribble. A scribble's page title is the start of its own text.
- `/sitemap-index.xml` (generated at build time), `/robots.txt` (points to the sitemap) and `/rss.xml` (every entry,
  newest first; linked from every page for feed readers).
- The 404 page is `noindex` and has no canonical link.
- **Set `SITE_URL`** (see Deployment). All of the above use it for absolute addresses. After publishing, submit
  `https://your-site/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.

## Design system

All tokens live in `src/styles/` (`tokens.css` for spacing, type and shape; `theme.css` for every colour, light and dark side by side); components use nothing else.

- **Spacing:** a strict 4-point scale (`--space-1` = 4px … `--space-24` = 96px) for every margin, padding and gap.
- **Type:** Alegreya Sans for English, Arima for Malayalam. One ramp (`--fs-display`, `--fs-h2`, `--fs-h3`,
  `--fs-lead`, `--fs-body`, `--fs-small`, `--fs-meta`, `--fs-label`) with paired line heights on the same grid.
  Any `lang="ml"` element automatically gets taller line heights. Weights: 400, 700, 800.
- **Layout:** two widths: lists are `--container-feed` (48rem); reading text is `--measure-reading` (75ch, measured in the
  text's own font, so a line holds about the same number of characters in Malayalam and English); plus one
  responsive gutter (16 / 24 / 40px).
- **Shape:** radius 4px (badges), 8px (images inside cards), 12px (cards and panels), full (buttons and pills).
  Cards have a 1px border; elevation (`--shadow-md`) appears only on hover.
- **Controls:** buttons, navigation links and the theme switcher are all 40px tall; icon buttons are 32px.
- **Motion:** 150–250ms with one easing curve, only in response to the reader. Photographs fade in once loaded.

## Fonts

The fonts are set up in `astro.config.mjs` with Astro's Fonts API and the Google provider.
They are downloaded at build time and served from your own site:

- **Alegreya Sans** (`--font-ui`): English UI text
- **Arima** (`--font-ml`): Malayalam text. Anything marked `lang="ml"` uses it automatically.

The build machine needs access to `fonts.google.com`, `fonts.googleapis.com` and `fonts.gstatic.com`.

## Accessibility

- A skip link, landmarks, and a logical heading order
- A visible focus ring on everything you can interact with. The theme switcher is two real buttons: Tab reaches
  both, and Enter or Space switches the theme.
- On phones the navigation collapses into a menu button (with `aria-expanded`); Escape, a tap outside, or tabbing
  away closes it. Without JavaScript the links stay visible in a row instead.
- Text contrast meets WCAG AA in both themes
- `prefers-reduced-motion` turns off smooth scrolling, the hero zoom, hover lifts and highlight animations
- The theme follows the operating system until the reader picks one; the choice is saved in `localStorage`
  and applied before the first paint, so there is no flash

## Photo credits

The stock photographs are from [Unsplash](https://unsplash.com/) and are used under the Unsplash License.
