#!/bin/bash
set -e

APP_DIR="/opt/eventhive"
BACKEND_DIR="$APP_DIR/backend"
PM2_APP_NAME="eventhive-backend"

echo "=== EventHive Deploy Script ==="
echo "This script redeploys the latest EventHive backend code"
echo ""

# Ensure Node.js is installed (installs if missing, otherwise no-op)
if ! command -v node &> /dev/null; then
  echo "[1/4] Node.js not found. Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "[1/4] Node.js already installed ($(node -v)). Skipping."
fi

# Pull latest code
echo "[2/4] Pulling latest code from GitHub..."
cd "$APP_DIR"
if [ -d ".git" ]; then
  git pull origin main
else
  echo "No git repository found at $APP_DIR. Run ec2-setup.sh first."
  exit 1
fi

# Install dependencies
echo "[3/4] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --production

# Restart PM2
echo "[4/4] Restarting PM2 process..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME"
else
  echo "PM2 process '$PM2_APP_NAME' not found, starting fresh via ecosystem.config.cjs..."
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo ""
echo "=== Deploy Complete ==="
echo "Check status: pm2 status"
echo "View logs: pm2 logs $PM2_APP_NAME"
