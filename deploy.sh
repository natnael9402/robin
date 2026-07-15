#!/bin/bash
set -e

echo "==================================="
echo " Robin Trade Premium — VPS Setup"
echo "==================================="

# 1. Install Docker
if ! command -v docker &> /dev/null; then
    echo "[1/6] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/6] Docker already installed"
fi

# 2. Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[2/6] Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "[2/6] Docker Compose already installed"
fi

# 3. Install PostgreSQL client (for dump restore)
if ! command -v psql &> /dev/null; then
    echo "[3/6] Installing PostgreSQL client..."
    apt-get update && apt-get install -y postgresql-client
else
    echo "[3/6] PostgreSQL client already installed"
fi

# 4. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "[4/6] Installing Nginx..."
    apt-get update && apt-get install -y nginx
    systemctl enable nginx
else
    echo "[4/6] Nginx already installed"
fi

# 5. Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "[5/6] Installing Certbot..."
    apt-get update && apt-get install -y certbot python3-certbot-nginx
else
    echo "[5/6] Certbot already installed"
fi

# 6. Check for .env
if [ ! -f .env ]; then
    echo "[6/6] No .env found! Copying from production.env.example..."
    cp production.env.example .env
    echo ">>> EDIT .env WITH YOUR SECRETS BEFORE STARTING <<<"
    echo ">>> Run: nano .env"
    exit 1
else
    echo "[6/6] .env found"
fi

echo ""
echo "==================================="
echo " Setup Complete! Next steps:"
echo "==================================="
echo ""
echo "1. Edit .env with your secrets:"
echo "   nano .env"
echo ""
echo "2. Restore the database (if first time):"
echo "   docker compose up -d db"
echo "   sleep 5"
echo "   docker exec -i robin-db psql -U postgres -d base_trade_prod < full_dump.sql"
echo ""
echo "3. Start all services:"
echo "   docker compose up -d --build"
echo ""
echo "4. Get SSL certificate:"
echo "   certbot --nginx -d paxoracapitalpro.com -d admin.paxoracapitalpro.com -d api.paxoracapitalpro.com"
echo ""
echo "5. Setup Nginx:"
echo "   cp nginx/robin.conf /etc/nginx/sites-available/robin"
echo "   ln -sf /etc/nginx/sites-available/robin /etc/nginx/sites-enabled/robin"
echo "   rm -f /etc/nginx/sites-enabled/default"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "6. Point DNS:"
echo "   A Records:"
echo "   paxoracapitalpro.com      -> VPS_IP"
echo "   admin.paxoracapitalpro.com -> VPS_IP"
echo "   api.paxoracapitalpro.com   -> VPS_IP"
echo ""
echo "Done!"
