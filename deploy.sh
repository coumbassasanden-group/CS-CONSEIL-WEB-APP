#!/bin/bash
set -e

APP_DIR="/www/wwwroot/production/CS-CONSEIL-WEB-APP"
APP_NAME="cs-conseil"

echo "🚀 Déploiement $APP_NAME..."
cd "$APP_DIR"

# Pull sur la branche réellement déployée. Le script tirait `main` en dur alors
# que la production tourne sur `development` : un déploiement pouvait installer
# la mauvaise branche.
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "📥 Git pull ($BRANCH)..."
git pull origin "$BRANCH"

# Install dependencies
echo "📦 Installation des dépendances..."
npm install --production=false

# Build
echo "🔨 Build Nuxt..."
npm run build

# Restart PM2 en rechargeant .env : sans `--update-env`, PM2 garde
# l'environnement du tout premier démarrage et ignore toute variable ajoutée
# depuis (clés Paxity, secret interne, base GeoIP…).
echo "♻️  Redémarrage PM2 (avec rechargement de .env)..."
set -a; . ./.env; set +a
pm2 restart "$APP_NAME" --update-env

# Wait and verify
sleep 3
if pm2 show "$APP_NAME" | grep -q "online"; then
  echo "✅ $APP_NAME déployé et en ligne !"
else
  echo "❌ Erreur : $APP_NAME n'est pas online"
  pm2 logs "$APP_NAME" --lines 20 --nostream
  exit 1
fi
