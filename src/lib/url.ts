// Единая каноническая форма URL: без `.html` и без хвостового слэша
// (кроме корня). Используется для canonical, og:url и JSON-LD, чтобы
// совпадать с тем, что отдаёт sitemap (trailingSlash: 'never').
export function canonical(pathname: string, site: URL | undefined): string {
  let p = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (p === '') p = '/';
  return new URL(p, site).href;
}
