#!/bin/bash
set -e

APP_DIR="/www/wwwroot/production/CS-CONSEIL-WEB-APP"
APP_NAME="cs-conseil"

echo "🚀 Déploiement $APP_NAME..."
cd "$APP_DIR"

# Pull latest changes
echo "📥 Git pull..."
git pull origin main

# Install dependencies
echo "📦 Installation des dépendances..."
npm install --production=false

# Build
echo "🔨 Build Nuxt..."
npm run build

# Restart PM2
echo "♻️  Redémarrage PM2..."
pm2 restart $APP_NAME

# Wait and verify
sleep 3
if pm2 show $APP_NAME | grep -q "online"; then
  echo "✅ $APP_NAME déployé et en ligne !"
else
  echo "❌ Erreur : $APP_NAME n'est pas online"
  pm2 logs $APP_NAME --lines 20 --nostream
  exit 1
fi
