#!/bin/bash

# Configuration
SERVER_IP="8.155.162.119"
SERVER_USER="root"
SERVER_DIR="/root/tarot"
DEPLOY_ARCHIVE="easydynasty_deploy.tar.gz"

echo "🚀 Starting Perfect Release Deployment..."

# 1. Frontend Build
echo "📦 Building Frontend..."
cd web
rm -rf .next
pnpm install
pnpm build
cd ..

# 2. Package
echo "📦 Packaging files..."
tar -czf $DEPLOY_ARCHIVE \
    web/.next \
    web/public \
    web/package.json \
    web/pnpm-lock.yaml \
    web/next.config.ts \
    backend/main.py \
    backend/requirements.txt \
    backend/app \
    --exclude "node_modules" \
    --exclude ".git"

echo "✅ Package created: $DEPLOY_ARCHIVE"

# 3. Upload
echo "📤 Uploading to server..."
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
scp $DEPLOY_ARCHIVE $SERVER_USER@$SERVER_IP:/root/

# 4. Remote Execution
echo "🔄 Connecting to server to install and restart..."
ssh $SERVER_USER@$SERVER_IP << EOF
    cd $SERVER_DIR
    
    echo "📂 Extracting files..."
    tar -xzf /root/$DEPLOY_ARCHIVE -C $SERVER_DIR
    
    echo "🔧 Checking Backend venv..."
    if [ ! -d "backend/venv" ]; then
        cd backend && python3 -m venv venv && cd ..
    fi
    
    echo "🔧 Updating Backend Dependencies..."
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
    
    echo "🔧 Updating Frontend Dependencies..."
    cd web
    pnpm install --prod
    cd ..

    echo "🔄 Restarting Services..."
    systemctl restart tarot-backend
    pm2 restart tarot-frontend
    
    echo "🧹 Cleaning up..."
    rm /root/$DEPLOY_ARCHIVE
    
    echo "✅ Deployment Complete!"
EOF

echo "🎉 Done!"

