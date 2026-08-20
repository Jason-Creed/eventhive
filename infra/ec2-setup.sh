#!/bin/bash
set -e

echo "=== EventHive EC2 Setup Script ==="
echo "This script sets up the EC2 instance for EventHive backend deployment"

# Update system
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "[3/8] Installing PM2 process manager..."
sudo npm install -g pm2

# Install MySQL client (for testing DB connectivity)
echo "[4/8] Installing MySQL client..."
sudo apt install -y mysql-client

# Create app directory
echo "[5/8] Setting up application directory..."
sudo mkdir -p /opt/eventhive
sudo chown -R $USER:$USER /opt/eventhive
cd /opt/eventhive

# Clone or update repository
echo "[6/8] Cloning/pulling repository..."
if [ -d ".git" ]; then
    git pull origin main
else
    echo "Please manually clone the repository to /opt/eventhive"
    echo "git clone <repo-url> /opt/eventhive"
    exit 1
fi

# Install dependencies
echo "[7/8] Installing backend dependencies..."
cd /opt/eventhive/backend
npm install --production

# Create logs directory
mkdir -p /opt/eventhive/backend/logs

# Create PM2 ecosystem file
echo "[8/8] Configuring PM2..."
cat > /opt/eventhive/backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'eventhive-backend',
      script: './src/app.js',
      cwd: '/opt/eventhive/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/opt/eventhive/backend/logs/err.log',
      out_file: '/opt/eventhive/backend/logs/out.log',
      log_file: '/opt/eventhive/backend/logs/combined.log',
      time: true
    }
  ]
};
EOF

# Start app with PM2
cd /opt/eventhive/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Configure .env file in /opt/eventhive/backend with your values"
echo "2. Run migrations: npm run migrate"
echo "3. Run seeds: npm run seed"
echo "4. Configure PM2: pm2 start ecosystem.config.js"
echo "5. Check status: pm2 status"
echo "6. View logs: pm2 logs eventhive-backend"
echo ""
