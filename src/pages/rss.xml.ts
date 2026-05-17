import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    // Без хвостового слэша — совпадает с canonical и sitemap.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
    })),
  });
}
