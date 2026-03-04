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

### Direct deploy from this machine

1. Create API token permissions in Cloudflare:
- `Account` -> `Cloudflare Pages` -> `Edit`
- `Zone` -> `DNS` -> `Edit`
- `Zone` -> `Zone` -> `Read`
- Zone Resources: include `open-rtls.com`

2. Create local credentials file:

```bash
cp cloudflare.env.example cloudflare.env
```

Fill in `CLOUDFLARE_API_TOKEN` in `cloudflare.env`.

3. Deploy:

```bash
npm run deploy:cloudflare
```

This command builds the site, creates the Pages project if needed, deploys to production, and attaches:
- `open-rtls.com`
- `www.open-rtls.com`

4. In Cloudflare dashboard, add a redirect rule:
- Source: `https://www.open-rtls.com/*`
- Target: `https://open-rtls.com/$1`
- Status: `301`

## Scope

This first iteration focuses on a usable initial website version.
Deployment automation and additional operational tooling will be added in subsequent iterations.
