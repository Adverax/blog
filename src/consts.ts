// Глобальные константы сайта. Меняются здесь, используются везде.

export const SITE_TITLE = 'Adverax';
export const SITE_DESCRIPTION =
  'Блог Adverax: обзоры оборудования, интеграции домашних энергосистем, ' +
  'сравнения протоколов и кейсы. Каталог проверенных программных компонентов — скоро.';

// Автор по умолчанию (если не указан во frontmatter статьи).
export const DEFAULT_AUTHOR = 'Команда Adverax';

// Локаль для форматирования дат и атрибута lang.
export const SITE_LOCALE = 'uk-UA';
export const SITE_LANG = 'ru';

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
