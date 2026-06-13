// Глобальные константы сайта. Меняются здесь, используются везде.

export const SITE_TITLE = 'Roman Miakotin';
export const SITE_DESCRIPTION =
  'Roman Miakotin — solution architect and engineer building systems that ' +
  'hold where they are not allowed to fail. 15+ years in high-load ' +
  'distributed systems. Field notes, one layer up from any product.';

// Автор по умолчанию (если не указан во frontmatter статьи).
export const DEFAULT_AUTHOR = 'Roman Miakotin';

// Личная подпись-биография под каждой статьёй (компонент AuthorBio.astro).
// Это отдельная от DEFAULT_AUTHOR / JSON-LD сущность: там Organization для
// structured data, здесь — человеческая подпись и «founding CTO» сигнал.
// Меняется тут, рендерится под всеми постами. Рендерится как:
// «I'm <name> — <bio> <links>».
export const AUTHOR_BIO = {
  name: 'Roman Miakotin',
  // Короткий титул для Person JSON-LD и шапки hire-me страницы.
  jobTitle: 'Solution Architect & Engineer',
  location: 'Kyiv, Ukraine (remote)',
  bio:
    "solution architect and engineer, 15+ years in high-load distributed " +
    "systems (Go; healthcare, telecom, crypto), based in Kyiv, working " +
    "remotely. I build systems meant to hold where they're not allowed to " +
    "fail. If you're an early-stage team that needs a founding CTO who " +
    "thinks this way, I'd like to hear from you.",
  links: [
    { label: 'GitHub', href: 'https://github.com/adverax' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/roman-miakotin-904831230' },
  ],
};

// Локаль для форматирования дат и атрибута lang.
export const SITE_LOCALE = 'en-US';
export const SITE_LANG = 'en';

// Фаза A: продукт (EMS/Adverax marketplace) публично не анонсирован.
// Пока false — скрываем ТОЛЬКО продуктовый маркетинговый CTA (Cta.astro).
// About теперь личная hire-me страница (src/pages/about.astro) и от этого
// флага НЕ зависит — видна всегда. Для анонса продукта: поставить true.
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
