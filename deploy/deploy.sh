#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker first: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example — please edit JWT_SECRET before production use."
  else
    echo "Missing .env file. Set JWT_SECRET at minimum."
    exit 1
  fi
fi

if grep -q "replace-with-a-long-random-secret" .env 2>/dev/null; then
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -base64 48 | tr -d '\n')
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${SECRET}|" .env
    echo "Generated random JWT_SECRET in .env"
  else
    echo "Warning: JWT_SECRET still uses placeholder. Edit .env before going live."
  fi
fi

docker compose -f docker-compose.prod.yml pull mongodb nginx 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Deploy complete."
echo "  Local:  http://localhost:${HTTP_PORT:-80}"
echo "  Public: http://<your-server-public-ip>"
echo ""
docker compose -f docker-compose.prod.yml ps
