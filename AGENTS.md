# AGENTS.md

## Project Overview

This repository contains the Open RTLS marketing and documentation website for `open-rtls.com`.

Core stack:

- Hugo for site generation
- Tailwind CSS v4 for styling
- Vite for frontend asset builds
- Cloudflare Pages for hosting

Useful commands:

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run stop`

## Repository Layout

- `content/`: editable site pages, news posts, FAQ, legal pages, and product landing pages
- `data/en/home.yaml`: source of truth for homepage section content and ordering
- `data/en/products/*.yaml`: product page content and structure
- `layouts/`: Hugo templates and partials
- `layouts/partials/home/`: homepage section partials
- `assets/`: frontend CSS and TypeScript sources
- `scripts/`: validation, search generation, and deployment helpers

## Project Skills

This repository includes project-local Codex skills in `.codex/skills/`:

### `open-rtls-copy-tone`

Use when editing user-facing copy.

- Keep language direct, concrete, and specific.
- Prefer technically accurate claims over generic marketing phrasing.
- Keep pages short and purposeful.
- Avoid rewriting generated Hub documentation pages.

Skill file:

- [open-rtls-copy-tone](/Users/jillesvangurp/git/open-rtls/website/.codex/skills/open-rtls-copy-tone/SKILL.md)

### `open-rtls-homepage-componentization`

Use when changing homepage content or layout.

- Treat `data/en/home.yaml` as the homepage source of truth.
- Keep `content/_index.md` limited to homepage metadata.
- Do not hardcode homepage copy in `layouts/index.html`.
- Add or update homepage section partials under `layouts/partials/home/` when structure changes.

Skill file:

- [open-rtls-homepage-componentization](/Users/jillesvangurp/git/open-rtls/website/.codex/skills/open-rtls-homepage-componentization/SKILL.md)

## Editing Rules

1. Preserve existing Hugo, content, and data-driven patterns.
2. Prefer editing structured content in `data/` and `content/` before changing templates.
3. Validate homepage work with `npm run check:homepage`.
4. Run `npm run build` for changes that affect rendered output.

## Open Location Hub Docs

The documentation pages under `content/open-location-hub/docs/` are generated from the Open Location Hub project, not authored in this repository.

Rules:

- Do not manually edit files under `content/open-location-hub/docs/`.
- Treat front matter flags such as `generated: true` and `generated_from:` as authoritative.
- If Hub documentation content needs to change, make that change in the Open Location Hub source project and re-sync or regenerate the website docs from there.

This restriction applies specifically to the generated Hub documentation pages under `content/`. Other website pages can be edited normally unless they are explicitly marked as generated.
