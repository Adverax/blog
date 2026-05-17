import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

// Опубликованные статьи, отсортированные от новых к старым.
// Черновики (draft: true) видны только в dev, в проде исключены.
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}
