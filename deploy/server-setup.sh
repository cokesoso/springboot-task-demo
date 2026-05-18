#!/usr/bin/env bash
# Run once on a fresh Ubuntu/Debian cloud server (as root or with sudo)
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash deploy/server-setup.sh"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git ufw

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Firewall: SSH + HTTP
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable

echo "Server ready. Next steps:"
echo "  1. Upload/clone project to /opt/demo"
echo "  2. cd /opt/demo && bash deploy/deploy.sh"
echo "  3. Open http://<public-ip> in browser"
