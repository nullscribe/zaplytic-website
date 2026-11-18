# Zaplytic Website

This is the official website for Zaplytic, built with [Astro](https://astro.build) as a fully
static site with no UI framework at runtime: pages are plain HTML, and animations are small
TypeScript modules (GSAP) loaded by the components that need them.

## Development

Requires Node.js 22.23.4 or newer.

```bash
yarn install
yarn dev       # dev server on http://localhost:4321
yarn build     # type-check (astro check) and build to dist/
yarn preview   # serve the production build
yarn test      # all tests (unit + built-site)
yarn test:unit # scripts, data and components only (fast)
yarn test:site # builds the site and checks every generated page
yarn test:visual # screenshot comparison of the built site (run `yarn build` first)
yarn lint
```

## Structure

- `src/pages/` – routes (`/`, `/products`, `/about`, `/blog`, `/blog/[slug]`, `404`, `robots.txt`)
- `src/layouts/BaseLayout.astro` – HTML shell, theme bootstrapping, header and footer
- `src/components/Seo.astro` – title, description, canonical, Open Graph, Twitter and JSON-LD
- `src/components/` – Astro components; `icons.ts` holds the SVG path data
- `src/scripts/` – browser behaviour (theme toggle, nav, animations), testable in isolation
- `src/content.config.ts` – blog collection; posts are Markdown files in `blogs/`
- `src/loaders/` – static data for products, services, team and values

## Writing a blog post

Add a Markdown file to `blogs/` with this frontmatter (validated at build time):

```yaml
---
slug: my-post            # lowercase-with-hyphens, becomes /blog/my-post
title: "Post title"
description: "One or two sentences used for search results and link previews."
date: "2026-01-14"       # YYYY-MM-DD
author: "Jahid Hasan"
tags: [rails, ruby]
featured: false
---
```

The sitemap (`/sitemap-index.xml`) is generated automatically on build.

## Tests

- `src/**/*.test.ts` – unit tests. Scripts run against a simulated DOM (happy-dom); `.astro`
  components are rendered with Astro's Container API (files marked `@vitest-environment node`).
- `tests/site/` – builds the real site once, then checks every page: one `<h1>`, title and
  description, canonical = sitemap URL, valid JSON-LD, working internal links and anchors,
  `robots.txt`, the theme bootstrap script, and a JavaScript size budget.
- `tests/visual/` – Playwright screenshots of every page (light and dark, desktop and mobile)
  plus the open mobile menu and theme toggle, compared pixel for pixel with the baselines in
  `tests/visual/__screenshots__`. Time is frozen and motion reduced so runs are deterministic.
  The baselines were verified identical to the original Vite site before the Astro migration.
  After an intended design change, accept it with `yarn test:visual --update-snapshots`.
  Screenshots depend on the OS's font rendering, so record and compare on the same platform
  (the baselines were recorded on macOS).
