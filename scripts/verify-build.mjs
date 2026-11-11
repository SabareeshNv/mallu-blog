#!/usr/bin/env node
/**
 * Checks the built site (the `dist` folder) for the mistakes that are easy to make when changing it:
 *
 *   npm run build && npm run verify
 *
 * It needs no extra packages. Errors fail the run (exit code 1); warnings are only printed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
if (!existsSync(DIST)) {
  console.error(`No "${DIST}" folder. Run "npm run build" first.`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const error = (page, message) => errors.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = walk(DIST);
const pages = files.filter((file) => file.endsWith('.html'));
const rel = (file) => relative(DIST, file).split(sep).join('/');
const urlOf = (file) => {
  const path = '/' + rel(file).replace(/index\.html$/, '');
  return path === '/404.html' ? path : path;
};
const graphemes = new Intl.Segmenter('ml', { granularity: 'grapheme' });
const length = (text) => [...graphemes.segment(text)].length;
const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
const attr = (html, tag, key, value, read) => {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*\\b${key}="${value}"[^>]*>`, 'i'));
  const found = match?.[0].match(new RegExp(`\\b${read}="([^"]*)"`, 'i'));
  return found ? decode(found[1]) : null;
};

const titles = new Map();
const internalLinks = new Set();
const pagePaths = new Set(pages.map(urlOf));

for (const file of pages) {
  const page = rel(file);
  const html = readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);

  // ---- title, description, language, headings
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  if (!title) error(page, 'missing <title>');
  else {
    if (length(title) > 90) warn(page, `title is ${length(title)} characters; search results cut it off`);
    if (titles.has(title)) error(page, `same <title> as ${titles.get(title)}`);
    titles.set(title, page);
  }
  const description = attr(html, 'meta', 'name', 'description', 'content');
  if (!description) error(page, 'missing meta description');
  if (!/<html[^>]*\blang="[^"]+"/i.test(html)) error(page, '<html> has no lang attribute');
  const h1s = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1s !== 1) error(page, `has ${h1s} <h1> elements (expected exactly one)`);

  // ---- search and social metadata
  if (!noindex) {
    if (!/<link rel="canonical" href="https?:\/\//i.test(html)) error(page, 'missing absolute canonical link');
  }
  const ogImage = attr(html, 'meta', 'property', 'og:image', 'content');
  if (!ogImage || !/^https?:\/\//.test(ogImage)) error(page, 'og:image is missing or not an absolute URL');
  if (!attr(html, 'meta', 'name', 'twitter:card', 'content')) error(page, 'missing twitter:card');

  // ---- structured data must be valid JSON
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(json);
    } catch (cause) {
      error(page, `invalid JSON-LD (${cause.message})`);
    }
  }

  // ---- images need alt text (an empty alt is fine for decoration; Astro writes it as a bare `alt`)
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt(\s|=|>|\/)/i.test(tag)) error(page, `<img> without an alt attribute: ${tag.slice(0, 80)}`);
  }

  // ---- text that should never reach production
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ');
  for (const word of ['Your Name', 'you@example.com', 'lorem ipsum', 'TODO', 'DETAIL REQUIRED']) {
    if (text.toLowerCase().includes(word.toLowerCase())) error(page, `contains placeholder text "${word}"`);
  }
  if (/https?:\/\/localhost/.test(html)) warn(page, 'links point to localhost (set SITE_URL before deploying)');

  // ---- collect internal links
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    if (/^(https?:|mailto:|tel:|#)/i.test(href) || !href.startsWith('/')) continue;
    internalLinks.add(`${page} -> ${decode(href).split('#')[0]}`);
  }
}

// ---- every internal link must lead to a page or a file
for (const entry of internalLinks) {
  const [page, target] = entry.split(' -> ');
  let path = decodeURIComponent(target);
  if (path === '') continue;
  const exists =
    existsSync(join(DIST, path)) && statSync(join(DIST, path)).isFile()
      ? true
      : pagePaths.has(path.endsWith('/') ? path : path + '/');
  if (!exists) error(page, `broken internal link: ${target}`);
}

// ---- sitemap, robots and feed
const read = (name) => (existsSync(join(DIST, name)) ? readFileSync(join(DIST, name), 'utf8') : null);
const robots = read('robots.txt');
if (!robots) error('robots.txt', 'missing');
else if (!/^Sitemap: https?:\/\//m.test(robots)) error('robots.txt', 'does not point to the sitemap');

const sitemap = read('sitemap-0.xml');
if (!sitemap) error('sitemap-0.xml', 'missing');
else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(new URL(m[1]).pathname));
  for (const path of pagePaths) {
    if (path === '/404.html') continue;
    if (!locs.includes(path)) error('sitemap-0.xml', `does not list ${path}`);
  }
  for (const path of locs) if (!pagePaths.has(path)) error('sitemap-0.xml', `lists ${path}, which is not a built page`);
}

const feed = read('rss.xml');
if (!feed) error('rss.xml', 'missing');
else {
  const items = feed.match(/<item>/g)?.length ?? 0;
  const posts = [...pagePaths].filter((path) => /^\/(essay|scribble)\//.test(path)).length;
  if (items !== posts) error('rss.xml', `has ${items} items but the site has ${posts} essays and scribbles`);
}

// ---- report
const label = `${pages.length} pages checked`;
for (const message of warnings) console.warn(`  warning  ${message}`);
for (const message of errors) console.error(`  ERROR    ${message}`);
if (errors.length) {
  console.error(`\nFAILED: ${errors.length} error(s), ${warnings.length} warning(s) — ${label}.`);
  process.exit(1);
}
console.log(`OK: ${label}, ${warnings.length} warning(s).`);
