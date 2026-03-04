# Open RTLS Website

First iteration Hugo one-pager for `open-rtls.com`.

## Stack

- Hugo
- Tailwind CSS v4 (`@tailwindcss/typography`)
- Vite for frontend asset build
- Cloudflare Pages static hosting

## Development

```bash
npm ci
npm run dev
```

## Production build

```bash
npm ci
npm run build
```

Build output directory is `public/`.

## Cloudflare Pages

Use these settings:

- Build command: `npm ci && npm run build`
- Build output directory: `public`

`wrangler.toml` is included as a Pages-ready scaffold for future iteration needs.

## Scope

This first iteration focuses on a usable initial website version.
Deployment automation and additional operational tooling will be added in subsequent iterations.
