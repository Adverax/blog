# Adverax Blog

Публичный блог Adverax — точка входа в проект (analysis §7). Astro, контент в
Markdown/MDX, деплой на Cloudflare Pages, домен `https://adverax.io` (блог под
`/blog`). План: см. `doc/analysis/adverax-blog-plan.md` в репозитории `adverax/ems`.

## Стек

- **Astro 6** — zero-JS по умолчанию.
- **Tailwind v4** (через `@tailwindcss/vite`) + `@tailwindcss/typography`.
- **Content Collections** — статьи в `src/content/blog/`.
- **Pagefind** — статический поиск (индекс на postbuild).
- **Giscus** — комментарии (включается в Фазе 6, см. `src/consts.ts`).
- **@astrojs/rss + @astrojs/sitemap** — фид и карта сайта.

## Команды

| Команда | Действие |
| :------ | :------- |
| `npm install` | Установка зависимостей |
| `npm run dev` | Дев-сервер на `localhost:4321` (черновики видны) |
| `npm run build` | Прод-сборка в `dist/` + индекс Pagefind |
| `npm run preview` | Локальный предпросмотр сборки (поиск работает) |
| `npm run check` | Проверка типов и контент-схемы |

> Поиск Pagefind работает только после `build`/`preview`, не в `dev`.

## Как добавить статью

1. Создать ветку.
2. Добавить файл `src/content/blog/<slug>.md` (или `.mdx`).
3. Frontmatter:

```yaml
---
title: "Заголовок"            # обязательно, ≤120 символов
description: "Краткое описание" # обязательно, ≤300 — идёт в meta/OG/RSS
pubDate: 2026-05-17           # обязательно
updatedDate: 2026-05-20       # опционально
author: "Имя"                 # опционально (по умолчанию — из consts.ts)
tags: ["обзор", "modbus"]     # опционально
heroImage: ./hero.jpg         # опционально (относительный путь, оптимизируется)
heroAlt: "Описание картинки"  # опционально
draft: false                  # true — скрыто в проде, sitemap, RSS
---
```

4. URL статьи: `https://adverax.io/blog/<slug>`.
5. PR → CI (`astro check` + `build`) → merge в `main` → автодеплой Cloudflare Pages.

## Деплой

Cloudflare Pages, проект привязан к этому репозиторию:

- Build command: `npm run build`
- Output directory: `dist`
- Node: `.nvmrc` (22)
- Custom domain: `adverax.io` (апекс) + `www` → 301

Маркетплейса пока нет, поэтому это приложение единолично владеет апексом:
`/` — лендинг, `/blog` — блог. Cloudflare Workers не нужны (см. план, §0).
