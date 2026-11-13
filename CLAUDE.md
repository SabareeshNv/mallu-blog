# CLAUDE.md — Lone Voice

Grounding document for Claude. Read it at the start of every session and before any structural change.
If a request conflicts with it, say so before acting. Keep it accurate: see "Maintaining this file".

## 1. Project

A personal Malayalam blog, **Lone Voice**. Static Astro 7 site. English UI, Malayalam posts.
Hosted on Cloudflare Pages (push to `main` → rebuild).

- **Essays** = posts with a `title`. **Scribbles** = posts without one. One `posts` collection.
- Light and dark themes. The light theme background is white.
- Fonts via Astro's Font Provider (Google, self-hosted): Alegreya Sans (`--font-ui`, English), Arima (`--font-ml`, Malayalam).
- Vanilla modern CSS and JS only. No UI framework, no CSS framework.

## 2. Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server. Search does NOT work here (Pagefind indexes the built site). |
| `npm run build` | `astro build && pagefind --site dist` |
| `npm run validate` | `astro check` + build + `scripts/verify-build.mjs`. **Run before every push.** |
| `npm run format` / `format:check` | Prettier (printWidth 120, singleQuote, astro plugin) |

Node ≥ 22.23.4 (`.nvmrc` = 22). TypeScript strict. `@/` aliases `src/`.

## 3. Architecture

```
src/config/      site.ts, routes.ts, navigation.ts   ← single source for names, URLs, nav
src/content/posts/   Markdown posts (+ _template-scribble.md)
src/content.config.ts   collection + Zod schema
src/components/  feed/ home/ icons/ layout/ search/ seo/ ui/
src/layouts/     BaseLayout, PageLayout, EssayLayout, ScribbleLayout, MarkdownLayout
src/lib/         content/ (posts, slug, topics, group, kind, text, types), seo/ (schema, types), format, graphemes
src/pages/       routes (see §4)
src/scripts/     theme-init.js, image-fade.js
src/styles/      tokens.css, theme.css, base.css
scripts/verify-build.mjs
docs/ARCHITECTURE.md
```

Rules:
- Site name, author, page sizes, URLs and nav live in `src/config/*`. Never hard-code them in components.
- Business logic lives in `src/lib/*`, not in templates.
- Each component owns its template, scoped CSS and (if needed) script, using Astro's component scoping.
- Layouts compose: `BaseLayout` (head, header, footer, search dialog) ← `PageLayout` / `EssayLayout` / `ScribbleLayout`.

## 4. Content model and routing

Frontmatter: `title?`, `date`, `cover` (image), `coverAlt`, `slug?`, `tags[]` (topics), `draft`, `summary?`, `updated?`.
- `summary` and `updated` are essay-only. The build fails for a scribble that sets them, or if `updated` < `date`.
- Slugs (`lib/content/slug.ts`): Unicode letters/marks kept, capped at 180 bytes (long Malayalam titles once crashed the build with `ENAMETOOLONG`).

Routes: `/` and `/2…` (home feed), `/essays`, `/scribbles`, `/archive`, `/essay/<slug>`, `/scribble/<slug>`, `/topics`, `/topics/<tag>`, `/about`, `/privacy`, `/content-policy`, `/rss.xml`, `/robots.txt` (generated), `/404`.

Behaviour:
- Home feed is purely chronological, newest first. No featured essay. Max 30 per page (`SITE.feedPageSize`). Grouped by month.
- Essay page: full-width cover with title/date inside the image; text column 75ch; "Keep reading" (shared topics, topped up with recent posts). No Newer/Older and no "More entries".
- Scribble page: "More scribbles". Scribble permalink icon → `/scribble/<slug>`; "Read the essay →" links to the essay.
- Archive grouped by year.

## 5. Design system

**Look:** teal "monsoon" palette (accent #0a6c67 / #52d0c4, essay orange #b8400f / #ff9e6e, sun gold #f6c453, ink header/footer). Flat, editorial, restrained.

**Tokens (`styles/tokens.css`, `theme.css`):**
- Spacing: 4-point scale `--space-1…32`. Type: `--fs-*` / `--lh-*`, taller line-heights under `:lang(ml)`.
- Radii: 4 / 8 / 12 / full. Motion tokens. Containers: feed 48rem, wide 72rem. Measures: reading 75ch, masthead 90ch. Rail 19rem.
- Colours via `light-dark()` in `theme.css` only.
- **Use tokens, not raw values.** Lines and focus: `--border-thick`, `--focus-width`, `--focus-offset`, `--underline-offset`, `--tracking-tight`, `--ratio-banner/photo/compact`. Remaining raw literals are deliberate (hairlines, `sr-only`, code font-size). New colours go in `theme.css`.

**CSS standards:**
- Mobile-first: base styles are for the smallest screen; `min-width` queries add to them. Breakpoints: 30 / 40 / 48 / 64 / 80rem. **No `max-width` queries remain; do not add any.**
- The header is written in two cascade layers (`@layer base, header-small, header-wide;`): phone styles as the base, `min-width: 48rem` restoring the desktop layout. The layer-order line must stay, or `base.css` would override the header.
- Put `min-width` blocks after the base rule they override.
- Reset in `@layer base`. Prefer logical properties, grid/flex, no magic numbers.
- Semantic HTML first; ARIA only where HTML can't express it.

**Rejected by the user. Do not reintroduce without being asked:**
- Card-like designs, parallax, scroll reveals.
- The specific depth treatment tried earlier (reverted to commit `3526559`). The user is NOT against depth in general; a different, tasteful approach may be proposed (show it first), but never reinstate that one.
- Kasavu / maroon-and-gold palette (teal was restored).
- Coloured stripe across the top of the page; featured essay on the home page; sticky side column; search button in the header.
- Topics, About and RSS in header/footer nav (RSS lives in the home rail "follow" section); section above the footer; "Written in Malayalam" text; post counts in the hero; text-decoration on titles that sit over images.

**Layout facts:**
- Header: wordmark links home only (not the whole bar); Home, Essays, Scribbles, Archive; shows a menu below 48rem and the links from 48rem up (768px counts as wide); theme switcher at the right end (icons only).
- Home: full-width hero (first page only), then feed + right rail (search, About blurb, Topics, RSS) on large screens; rail is not sticky. Hero text and posts share the same left edge.
- On small screens the search sits above the posts, not in the header.
- Footer: a single bar. Links left, copyright right; below 30rem, stacked, links evenly spaced, copyright centred. CSS only.

## 6. JavaScript policy

Only what is needed, all inline and small (~5–6 KB total):
1. `theme-init` (head, before paint): sets `data-theme`, `data-js`.
2. ThemeSwitcher: two real buttons with `aria-pressed` (Enter/Space must work).
3. SiteHeader menu (the breakpoint in its `matchMedia` must match the header's 48rem).
4. SearchDialog (Ctrl/⌘+K or `/`; Essay/Scribble filters; query normalisation of legacy chillu spelling and trailing virama).
5. `image-fade` (images with `data-fade`).
6. ReadingProgress (essays only).

Removed on purpose: scribble hash script, footer wrap check, parallax. Before adding JS, check whether CSS or HTML can do it.

## 7. Accessibility

- Full keyboard operation; DOM order equals visual order (hence the theme switcher is duplicated for phone/desktop headers).
- Visible focus styles; skip link; one `<h1>` per page; meaningful `alt` (`coverAlt` required).
- `prefers-reduced-motion` respected. Motion only in response to user intent.
- Colour contrast checked in both themes.

## 8. SEO and search

- `components/seo/Seo.astro` + `lib/seo/schema.ts`: title, description, canonical, OG/Twitter, JSON-LD (WebSite, Blog, BlogPosting, BreadcrumbList). 404 is `noindex`.
- Sitemap (`@astrojs/sitemap`), RSS (`@astrojs/rss`), generated `robots.txt`.
- Search: Pagefind, index built after `astro build`. Index markup via `data-pagefind-*` in layouts: filters and date meta go on the `data-pagefind-body` element. Three hidden spans remain (scribble date; summary and tags weights). The build runs `scripts/prune-pagefind.mjs` to delete Pagefind's unused UI files.
- `verify-build.mjs` enforces: titles, descriptions, canonical, og:image, single h1, valid JSON-LD, alt text, duplicate ids, placeholder text, broken internal links, sitemap/robots/RSS consistency, Pagefind index present. Extend it when a new rule matters.

## 9. Workflow and conventions

- **Never invent content.** No placeholder text, fake posts, dates or contact details in production code.
- Work on a branch, run `npm run validate`, verify visually with Playwright (several widths, both themes, keyboard), then fast-forward merge to `main` and push. Pushing `main` triggers the Cloudflare rebuild.
- Show the user designs/options before building when they ask for it. Do not start work they have paused.
- Commit messages: short imperative subject (e.g. "Home: remove the featured latest essay"), body explaining why, plus the attribution trailers given by the session.
- Deployment: Cloudflare Pages, build `npm run build`, output `dist`, env `SITE_URL`; `site` resolves from `SITE_URL ?? URL ?? CF_PAGES_URL ?? http://localhost:4321`.
- Do not commit `node_modules`, `dist`, `.astro`.

**Lessons learned**
- Check the right `<footer>` (`.site-footer`, not a scribble's own).
- Prettier reformatting can break string-match edits; re-read before editing.
- Avoid toggling layout state from JS that depends on its own result (footer wrap-check feedback loop).
- Verify at 320, 360, 641, 768, 1024, 1280, 1536+ widths and with long Malayalam titles.
- Astro scoped CSS does not stop `:has(.child-class)` from matching elements in child components. Don't couple components that way; pass a class instead.
- Cascade layers lose to unlayered CSS and are ordered by first appearance. Always state the order explicitly.
- Verify visual refactors against recorded baselines: full-page screenshots, focus states and a width sweep. Mask or exclude timing-dependent captures such as the highlight fade.

## 10. Current plans

Status: site complete and deployed. The code clean-up is **done** (merged at `f5130c8`): mobile-first CSS, tokens, unused CSS removed, Pagefind markup tidied.

Known small changes from it: wordmark tracking `-0.02em`; the header goes wide at exactly 768px; prose link underline offset `0.25em`.

**Optional, not requested:** search entry on essay, scribble and text pages; replacing the remaining hidden Pagefind weight spans.

## 11. Maintaining this file

- I can't see a context-window meter. So I update this file (a) after each completed task or decision, (b) when a conversation has grown long or has just been compacted, and (c) when the user asks.
- Updates record: new decisions, rejected ideas, changed constraints, new lessons, and the current plan. Remove entries that are no longer true.
- Before relying on it, spot-check against the code (`git log`, file tree); the code wins if they disagree, and the file then gets fixed.
- Per the user's instruction: show the proposed change to the user before writing it.
