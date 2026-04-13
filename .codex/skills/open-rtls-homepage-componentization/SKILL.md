---
name: open-rtls-homepage-componentization
description: Keep the Open Location Stack homepage data-driven. Use when editing homepage content in /Users/jillesvangurp/git/open-rtls/website.
---

# Open Location Stack Homepage Componentization

Use this skill when changing homepage copy or layout in `/Users/jillesvangurp/git/open-rtls/website`.

## Rules

1. Treat `data/en/home.yaml` as the source of truth for homepage section content and ordering.
2. Keep `content/_index.md` limited to homepage metadata such as `title` and `description`.
3. Do not move homepage copy into `layouts/index.html` or into homepage front matter.
4. If a new homepage section layout is needed, add or update a partial under `layouts/partials/home/` instead of hardcoding content into the template.

## Validation

After homepage changes, run these commands from `/Users/jillesvangurp/git/open-rtls/website`:

```bash
npm run check:homepage
npm run build
```
