# Lone Voice — a Malayalam notebook

A personal blog/microblog built with **Astro 7**, plain modern CSS and vanilla JavaScript.
Posts are written in Malayalam; the interface is in English.

## Commands

| Command           | Action                                  |
| ----------------- | --------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Start the dev server at `localhost:4321` |
| `npm run build`   | Build the static site into `dist/`      |
| `npm run preview` | Preview the built site                  |
| `npm run check`   | Type-check the project                  |

## Writing posts

All posts live in one collection: `src/content/posts/`. Copy `_template-scribble.md` to start
(files beginning with `_` are ignored).

```md
---
title: മഴയുടെ ഓർമ്മകൾ        # with a title → Essay   (/essay/<title-slug>/)
date: 2026-10-28             # required
cover: ../../assets/images/rain-window.jpg   # optional
coverAlt: Raindrops on a window              # describe the cover for screen readers
slug: mazha                  # optional: custom essay URL instead of the Malayalam title
draft: true                  # optional: hidden from production builds
---
```

- **Essay**: has a `title`. Its URL is `/essay/<slug of the title>/`. The feed shows the title as a link, with the cover if there is one.
- **Scribble**: no `title`. Its URL is `/scribble/<file-name>/`. The feed shows the full text and an icon-only permalink.
  Clicking the permalink in a list scrolls to the scribble and highlights it. The scribble's own page has a
  "See it in the stream" link that opens the right feed page, scrolled to that scribble.

Put cover images in `src/assets/images/`. Astro optimises them into responsive WebP at build time.

## Settings

Edit `src/site.config.ts` to set the site title, tagline, byline, social profiles, an optional contact e-mail
(when empty, the first social profile is used on the policy pages), and the page sizes:

```ts
feedPageSize: 30,     // entries per page on Home, Essays and Scribbles
archivePageSize: 30,  // entries per archive page
```

## Structure

```
src/
  site.config.ts        site settings and page sizes
  content.config.ts     the `posts` collection schema
  lib/posts.ts          sorting, grouping by month/year, URLs, excerpts
  layouts/BaseLayout.astro   <head>, fonts, theme bootstrap, design tokens and base styles
  layouts/PageLayout.astro   simple English text pages (the policies)
  components/           each component keeps its own scoped <style> and <script>
    SiteHeader, SiteFooter, ThemeSwitcher, Hero
    Feed, MonthGroup, EssayEntry, ScribbleEntry, PermalinkIcon, Prose
    ArchiveYear, Pagination, PostNav, FormattedDate
    icons/                EssayIcon, ScribbleIcon, SunIcon, MoonIcon (custom SVGs)
  pages/
    [...page].astro           home feed, grouped by month: /, /2/, …
    essays/[...page].astro    essays only:    /essays/, /essays/2/, …
    scribbles/[...page].astro scribbles only: /scribbles/, /scribbles/2/, …
    archive/[...page].astro   archive, grouped by year:  /archive/, /archive/2/, …
    essay/[slug].astro        full-width cover with the title, date and reading time inside it
    scribble/[slug].astro
    privacy.astro             /privacy/
    content-policy.astro      /content-policy/
    404.astro
```

## Deployment

Set `SITE_URL` in your host's build settings to the public address (for example `https://lonevoice.pages.dev`).
It is used for canonical links and social-preview images. Netlify's `URL` and Cloudflare Pages' `CF_PAGES_URL`
are picked up automatically when `SITE_URL` is not set.

## Design system

All tokens live at the top of `src/layouts/BaseLayout.astro`; components use nothing else.

- **Spacing:** a strict 4-point scale (`--space-1` = 4px … `--space-24` = 96px) for every margin, padding and gap.
- **Type:** Alegreya Sans for English, Arima for Malayalam. One ramp (`--fs-display`, `--fs-h2`, `--fs-h3`,
  `--fs-lead`, `--fs-body`, `--fs-small`, `--fs-meta`, `--fs-label`) with paired line heights on the same grid.
  Any `lang="ml"` element automatically gets taller line heights. Weights: 400, 700, 800.
- **Layout:** two containers (`--container-feed` 48rem for lists, `--container-prose` 42rem for reading) and one
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
- A visible focus ring on everything you can interact with. The theme switcher is a native radio group,
  so arrow keys work.
- Text contrast meets WCAG AA in both themes
- `prefers-reduced-motion` turns off smooth scrolling, the hero zoom, hover lifts and highlight animations
- The theme follows the operating system until the reader picks one; the choice is saved in `localStorage`
  and applied before the first paint, so there is no flash

## Photo credits

The stock photographs are from [Unsplash](https://unsplash.com/) and are used under the Unsplash License.
