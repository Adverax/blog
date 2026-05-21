// Глобальные константы сайта. Меняются здесь, используются везде.

export const SITE_TITLE = 'Adverax';
export const SITE_DESCRIPTION =
  'Architecture, IoT integration, and field notes from building energy ' +
  'software for places where blackouts are normal.';

// Автор по умолчанию (если не указан во frontmatter статьи).
export const DEFAULT_AUTHOR = 'Adverax Team';

// Локаль для форматирования дат и атрибута lang.
export const SITE_LOCALE = 'en-US';
export const SITE_LANG = 'en';

// Фаза A: продукт публично не анонсирован. Пока false — скрываем
// маркетинговый CTA (Cta.astro) и пункт «About» в навигации; страница
// About вынесена в src/pages/_about.astro, чтобы Astro не генерировал
// маршрут. Для запуска: поставить true И переименовать
// src/pages/_about.astro обратно в about.astro.
export const LAUNCH_ANNOUNCED = false;

// Giscus включается в Фазе 6 после настройки на giscus.app.
// До этого комментарии не рендерятся (репозиторий должен быть public,
// Discussions включены, giscus app установлен).
export const GISCUS = {
  enabled: false,
  repo: 'adverax/blog',
  repoId: '', // заполнить из giscus.app
  category: 'Comments',
  categoryId: '', // заполнить из giscus.app
};
