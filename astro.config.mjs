// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

/**
 * The public URL of the site, used for canonical links and social previews.
 * Set SITE_URL in your host's build settings (e.g. https://lonevoice.pages.dev).
 * Netlify (URL) and Cloudflare Pages (CF_PAGES_URL) values are used automatically when present.
 */
const site = process.env.SITE_URL ?? process.env.URL ?? process.env.CF_PAGES_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'ignore',

  // Fonts are downloaded from Google Fonts at build time and self-hosted.
  // Alegreya Sans sets all English text; Arima sets all Malayalam text.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Alegreya Sans',
      cssVariable: '--font-ui',
      weights: ['400', '700', '800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Arima',
      cssVariable: '--font-ml',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['malayalam', 'latin'],
      fallbacks: ['sans-serif'],
    },
  ],
});
