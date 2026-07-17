#!/bin/bash
set -e

echo "==================================="
echo " Paxora Premium Lab — VPS Setup"
echo "==================================="

# 1. Install Docker
if ! command -v docker &> /dev/null; then
    echo "[1/4] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/4] Docker already installed"
fi

# 2. Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[2/4] Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "[2/4] Docker Compose already installed"
fi

# 3. Install PostgreSQL client (for dump restore)
if ! command -v psql &> /dev/null; then
    echo "[3/4] Installing PostgreSQL client..."
    apt-get update && apt-get install -y postgresql-client
else
    echo "[3/4] PostgreSQL client already installed"
fi

# 4. Check for .env
if [ ! -f .env ]; then
    echo "[4/4] No .env found! Copying from production.env.example..."
    cp production.env.example .env
    echo ">>> EDIT .env WITH YOUR SECRETS BEFORE STARTING <<<"
    echo ">>> Run: nano .env"
    exit 1
else
    echo "[4/4] .env found"
fi

echo ""
echo "==================================="
echo " Setup Complete! Next steps:"
echo "==================================="
echo ""
echo "1. Edit .env with your secrets:"
echo "   nano .env"
echo ""
echo "2. Build & start all services:"
echo "   docker compose up -d --build"
echo ""
echo "3. Restore the database (first time only):"
echo "   sleep 5"
echo "   docker exec -i robin-db psql -U postgres -d base_trade_prod < full_dump.sql"
echo ""
echo "4. Open Nginx Proxy Manager admin:"
echo "   http://YOUR_VPS_IP:81"
echo "   Default login: admin@example.com / changeme"
echo ""
echo "5. In NPM, add 3 Proxy Hosts:"
echo "   - paxorapremiumlab.com            -> robin-frontend:3000"
echo "   - admin.paxorapremiumlab.com      -> robin-admin:3001"
echo "   - api.paxorapremiumlab.com        -> robin-ol:4000"
echo "   Enable SSL (Request new Let's Encrypt cert) for each"
echo ""
echo "6. DNS Records (point to VPS IP):"
echo "   A  @      -> YOUR_VPS_IP"
echo "   A  admin  -> YOUR_VPS_IP"
echo "   A  api    -> YOUR_VPS_IP"
echo ""
echo "7. Set up email (info@paxorapremiumlab.com):"
echo "   - Create email account in Hostinger panel"
echo "   - Update SMTP settings in .env if needed"
echo ""
echo "Done! No certbot, no nginx config needed."
