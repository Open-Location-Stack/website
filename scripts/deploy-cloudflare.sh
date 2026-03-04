#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/cloudflare.env}"
PROJECT_NAME="open-rtls-website"
PRODUCTION_BRANCH="main"

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
if ! npx wrangler pages project list --json | jq -e --arg name "$PROJECT_NAME" '.[] | select(."Project Name" == $name)' >/dev/null; then
  npx wrangler pages project create "$PROJECT_NAME" --production-branch "$PRODUCTION_BRANCH"
fi

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy public --project-name "$PROJECT_NAME" --branch "$PRODUCTION_BRANCH"

echo
echo "Deploy finished."
