# Architecture

This is a static site built with [Astro](https://astro.build). It is written in plain HTML, CSS and TypeScript, with
no UI framework. Every page is generated at build time, so the published site is just files.

The structure follows four rules. They are what make the site easy to change later.

1. **Data, logic and design are kept apart.** What the site says (`config/`, `content/`), how it works (`lib/`) and how it
   looks (`styles/`, `components/`) each have one home.
2. **Pages are thin.** A file in `pages/` decides which URLs exist and which data they get. The markup lives in
   layouts and components.
3. **Every value is defined once.** Colours, spacing, type sizes, URLs, navigation and page sizes each have a single
   source. Components refer to it and never repeat it.
4. **A component owns its style and script.** Each `.astro` file keeps its own scoped `<style>` and `<script>` next to
   its markup. Only the design tokens and a small reset are global.

## Folder map

```
src/
  config/        What the site is and where things are. Plain data; edit freely.
    site.ts        title, tagline, byline, contact, page sizes, language
    routes.ts      every URL (ROUTES.essays, essayPath(slug), ...)
    navigation.ts  the header and footer links, and which one is "current"
  content/posts/ The writing: one Markdown file per post.
  content.config.ts   The schema every post must follow (title, date, cover, ...).

  lib/           Logic with no markup. Pure TypeScript, easy to test.
    content/       Reading posts: queries, kinds (essay or scribble), slugs, topics and related posts, grouping, excerpts
    seo/           schema.org structured data
    format.ts      Dates and counts, formatted for the interface
    graphemes.ts   Splits Malayalam text between letters, never inside one

  styles/        The only global CSS.
    tokens.css     Spacing, type, shape, motion, breakpoints
    theme.css      Every colour, light and dark side by side
    base.css       Reset, page typography, accessibility helpers (in a low-priority cascade layer)

  layouts/       The frame of a page.
    BaseLayout     <head>, skip link, header, <main>, footer
    PageLayout     A text page (the policies, About)
    MarkdownLayout The layout for pages written in Markdown (src/pages/*.md)
    EssayLayout    An essay: full-width masthead, text, neighbouring posts
    ScribbleLayout A scribble's own page

  components/    Reusable pieces, grouped by role.
    layout/        Header, footer, theme switcher
    feed/          Lists of posts: timeline, essay and scribble entries (EssayEntry has timeline, featured and grid
                   variants), EssayGrid, PostList, PostSection ("Keep reading"), TopicLinks, TopicList, archive, pagination
    home/          The home page: Hero, LatestEssay, HomeShell (two columns) and HomeRail (search, About, topics, RSS)
    ui/            Small building blocks: Container, Prose, PageHeader, FormattedDate, ContactLink, ReadingProgress
    seo/           Seo.astro: title, description, social cards, structured data
    search/        SearchDialog (Pagefind), SearchBar (above the posts; hidden on the home page beside the side column)
    icons/         Inline SVG icons

  pages/         Routes. Each file maps to URLs. about.md is the About page; topics/ holds the topic pages.
  scripts/       Plain scripts that must run inline, before the page paints (theme) or right after (image fade)
  assets/images/ Photographs (optimised at build time)

public/          Copied as-is: favicon, apple-touch-icon
scripts/         Developer tools (not part of the site): verify-build.mjs
```

Imports use the `@/` alias for `src/`, for example `import { SITE } from '@/config/site'`.

## How a page is built

```
 content/posts/*.md ──► content.config.ts (schema check)
                              │
                       lib/content (query, sort, group)
                              │
                 pages/* (which URLs, which data)
                              │
        layouts/* ──► components/* ──► HTML + scoped CSS + small scripts
                              │
                    styles/* (tokens, theme, base)
```

A post is an **essay** if it has a `title` and a **scribble** if it does not. That one rule, in
`lib/content/kind.ts`, decides its URL, its card in the feed and its page.

## Design system

All visual decisions are tokens, and a component uses nothing else.

- **Spacing** is a strict 4-point scale (`--space-1` ... `--space-24`).
- **Type** is one ramp (`--fs-display` ... `--fs-label`) with paired line heights. `:lang(ml)` swaps in taller line
  heights automatically for Malayalam.
- **Colour** lives in `theme.css`. Each colour is written once as `light-dark(<light>, <dark>)`. Which theme is active
  is decided by `color-scheme` on `<html>` (set by the theme switcher, or by the operating system when JavaScript is off).
- **Breakpoints** are listed at the top of `tokens.css`. CSS cannot use variables in media queries, so use only those.
- **Widths**: two, on purpose. Lists use `--container-feed`. Reading text uses `--measure-reading` (75ch). The label, title
  and date on an essay's cover sit in a slightly wider column, `--measure-masthead` (90ch). `ch` is measured in the font of the
  element that uses it, so these are set in the text's own font (`Container size="reading"`, with `lang="ml"` or `"en"`,
  and the essay masthead). Inside a reading container, interface text (labels, dates) sets `font-family: var(--font-sans)`
  explicitly, so it keeps the interface font.
- **Shape and motion**: three radii plus full, one border width, two durations, one easing curve.

## Making changes

| I want to...                         | Change...                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Write a post                         | Add a Markdown file to `src/content/posts/` (see the README)                                    |
| Rename the site, change the tagline  | `config/site.ts`                                                                                |
| Change how many posts per page       | `feedPageSize`, `archivePageSize` in `config/site.ts`                                           |
| Add, remove or reorder a header link | `MAIN_NAV` in `config/navigation.ts`                                                            |
| Add a footer link                    | `LEGAL_NAV` in `config/navigation.ts`                                                           |
| Change a URL                         | `config/routes.ts`                                                                              |
| Change a colour (either theme)       | `styles/theme.css`: one line                                                                    |
| Change spacing, type or radius       | `styles/tokens.css`                                                                             |
| Add a text page (e.g. About)         | New `.astro` file in `pages/` using `PageLayout`; add it to `ROUTES` and `MAIN_NAV` if linked   |
| Add a new kind of post               | `lib/content/kind.ts` and `config/routes.ts`; then a layout, an entry component and a page      |
| Change how an essay or scribble looks| `components/feed/EssayEntry.astro`, `ScribbleEntry.astro` (lists); `layouts/EssayLayout.astro`  |
| Change the header or footer          | `components/layout/SiteHeader.astro`, `SiteFooter.astro`                                        |
| Change what search engines see       | `components/seo/Seo.astro`, `lib/seo/schema.ts`                                                 |
| Add a field to posts                 | `src/content.config.ts`, then use it from the components that need it                           |
| Change what search indexes         | `data-pagefind-*` attributes in the layouts (essay, scribble, text page); the dialog is `components/search/` |
| Add a topic                          | Add the word to a post's `tags`; its page and the `/topics/` entry appear on their own          |
| Edit the About page                  | `src/pages/about.md`                                                                            |
| Change how many related posts show   | `relatedCount`, `moreScribblesCount` in `config/site.ts`                                        |

## Rules to keep it tidy

- No raw pixel, rem or colour values in a component. Add a token instead.
- No URL typed into a component. Use `ROUTES`, `essayPath()`, `postUrl()`.
- No date formatted in a component. Use `lib/format.ts`.
- A page file should contain data fetching and one layout or component, and nothing else.
- Put a script next to the component that needs it. Use `src/scripts/` only for code that must run inline.

## Checking your work

```bash
npm run validate     # type check, build, then verify the output
npm run format       # tidy the code (Prettier)
```

`npm run verify` (run after a build) checks every page for: a title, description, canonical link, share image and a
single `<h1>`; valid structured data; `alt` text on images; broken internal links; leftover placeholder text; and that
the sitemap, `robots.txt` and the RSS feed match the pages that were built.

Set `SITE_URL` to your real address before the build you deploy; otherwise absolute addresses point to `localhost`
(verify prints a warning).
