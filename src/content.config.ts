import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Коллекция статей блога. Контент — Markdown/MDX в src/content/blog,
// версионируется через git (analysis §4.4).
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      description: z.string().max(300),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      // draft: true — статья видна локально, но исключена из прода, sitemap и RSS.
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
