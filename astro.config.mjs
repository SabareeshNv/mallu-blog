// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  // Set this to your deployed URL (used for canonical links).
  site: 'https://example.com',
  trailingSlash: 'ignore',

  // Fonts are downloaded from Google Fonts at build time and self-hosted.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Alegreya Sans',
      cssVariable: '--font-ui',
      weights: ['400', '500', '700', '800'],
      styles: ['normal', 'italic'],
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
