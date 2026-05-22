// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Боевой домен. Нужен для canonical, sitemap и RSS.
  site: 'https://adverax.io',

  // Единый формат URL: без хвостового слэша.
  trailingSlash: 'never',

  build: {
    // /blog/post вместо /blog/post/index.html — единообразие URL.
    format: 'file',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],
  adapter: cloudflare(),
});