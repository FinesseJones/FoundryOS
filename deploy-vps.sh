#!/usr/bin/env bash
# ==============================================================================
# 🚀 FoundryOS Turnkey 1-Click VPS Deployment Script
# Frontend (React 19 + Vite) + Backend (Node.js LLM Proxy) + Caddy (Auto HTTPS)
# ==============================================================================

set -e

echo "========================================================"
echo "🛸 Deploying FoundryOS Fullstack Application on VPS"
echo "========================================================"

# 1. Ensure Docker & Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 2. Directory setup
APP_DIR="/opt/foundryos"
echo "📁 Setting up deployment directory at ${APP_DIR}..."

if [ -d "${APP_DIR}/.git" ]; then
    echo "🔄 Pulling latest updates from GitHub..."
    cd "${APP_DIR}"
    git pull origin main
else
    echo "📥 Cloning repository from GitHub..."
    git clone https://github.com/FinesseJones/FoundryOS.git "${APP_DIR}"
    cd "${APP_DIR}"
fi

# 3. Environment Configuration
if [ ! -f .env ]; then
    echo "⚙️ Creating default .env configuration..."
    cat <<EOF > .env
PORT=8787
NODE_ENV=production
DATA_DIR=/app/data
NVIDIA_API_KEY=${NVIDIA_API_KEY:-""}
DOMAIN_NAME=${DOMAIN_NAME:-""}
EOF
fi

# 4. Build and Start Fullstack Docker Suite
echo "🏗️ Building and starting Docker containers (Frontend, Backend API, Caddy SSL)..."
docker compose down || true
docker compose up -d --build

# 5. Health Check
echo "🔍 Checking container status..."
sleep 5
docker compose ps

SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
echo ""
echo "========================================================"
echo "🎉 FoundryOS is LIVE on your VPS!"
echo "🌐 Access your app at: http://${SERVER_IP}"
if [ -n "${DOMAIN_NAME}" ]; then
    echo "🔒 Custom Domain with Auto SSL: https://${DOMAIN_NAME}"
fi
echo "========================================================"
