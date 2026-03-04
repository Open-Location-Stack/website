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

3. One-time domain setup in Cloudflare Pages:
- Add custom domains to the Pages project:
  - `open-rtls.com`
  - `www.open-rtls.com`
- In DNS, point both hostnames to `open-rtls-website.pages.dev` as `CNAME` records.
- Keep DNS records as `DNS only` until domain status is `active`.
- Add redirect rule:
  - Source: `https://www.open-rtls.com/*`
  - Target: `https://open-rtls.com/$1`
  - Status: `301`

4. Deploy (repeatable):

```bash
npm run deploy:cloudflare
```

This command builds the site, ensures the Pages project exists, and deploys to production.

## Scope

This first iteration focuses on a usable initial website version.
Deployment automation and additional operational tooling will be added in subsequent iterations.
