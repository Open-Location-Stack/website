#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/cloudflare.env}"
PROJECT_NAME="open-rtls-website"
PRODUCTION_BRANCH="main"
APEX_DOMAIN="open-rtls.com"
WWW_DOMAIN="www.open-rtls.com"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  echo "Create it from cloudflare.env.example and retry."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

cd "$ROOT_DIR"

echo "Building site..."
npm run build

echo "Ensuring Cloudflare Pages project exists: $PROJECT_NAME"
if ! npx wrangler pages project list --json | rg -q '"name"\s*:\s*"'"$PROJECT_NAME"'"'; then
  npx wrangler pages project create "$PROJECT_NAME" --production-branch "$PRODUCTION_BRANCH"
fi

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy public --project-name "$PROJECT_NAME" --branch "$PRODUCTION_BRANCH"

echo "Ensuring custom domains are attached..."
for domain in "$APEX_DOMAIN" "$WWW_DOMAIN"; do
  if ! npx wrangler pages project domain list "$PROJECT_NAME" --json | rg -q '"name"\s*:\s*"'"$domain"'"'; then
    npx wrangler pages project domain add "$PROJECT_NAME" "$domain"
  fi
done

echo
echo "Deploy finished."
echo "Next in Cloudflare dashboard: create a Redirect Rule from https://www.open-rtls.com/* to https://open-rtls.com/\$1 (301)."
