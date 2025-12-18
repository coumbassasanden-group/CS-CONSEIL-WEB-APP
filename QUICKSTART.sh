#!/bin/bash
# 🚀 QUICK START - Démarrage rapide du système d'abonnement

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║    🚀 DÉMARRAGE RAPIDE - API Subscription Integration         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="${API_SUBSCRIPTION_URL:-http://localhost:3000/api/}"

echo -e "${BLUE}📋 Étape 1: Vérification de l'environnement${NC}"
echo "─────────────────────────────────────────────────────────────"

# Vérifier Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js non trouvé. Installez-le depuis https://nodejs.org"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm non trouvé"
    exit 1
fi

# Vérifier git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} git: $(git --version | awk '{print $3}')"
else
    echo -e "${YELLOW}⚠${NC} git non trouvé (optionnel)"
fi

echo ""

echo -e "${BLUE}📦 Étape 2: Installation des dépendances${NC}"
echo "─────────────────────────────────────────────────────────────"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo "Installation des dépendances..."
    npm install
    echo -e "${GREEN}✓${NC} Dépendances installées"
fi

echo ""

echo -e "${BLUE}⚙️  Étape 3: Configuration${NC}"
echo "─────────────────────────────────────────────────────────────"

# Vérifier .env
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "Création du fichier .env..."
    cat > .env << EOF
# API Subscription
API_SUBSCRIPTION_URL=http://localhost:3000/api/

# API Base
API_BASE_URL=https://nextapi.coumbassa-sanden.com

# Node Environment
NODE_ENV=development
EOF
    echo -e "${GREEN}✓${NC} .env créé"
else
    echo -e "${GREEN}✓${NC} Fichier .env existe"
fi

# Afficher la configuration
echo ""
echo "Configuration API:"
if [ -f ".env" ]; then
    grep "API_SUBSCRIPTION_URL" .env 2>/dev/null || echo "API_SUBSCRIPTION_URL=http://localhost:3000/api/"
else
    echo "API_SUBSCRIPTION_URL=$API_URL"
fi

echo ""

echo -e "${BLUE}📚 Étape 4: Vérification des fichiers${NC}"
echo "─────────────────────────────────────────────────────────────"

files=(
    "composables/useSubscription.ts"
    "pages/subscriber/index.vue"
    "type/index.ts"
    "composables/README.md"
    "API_SUBSCRIPTION_README.md"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (manquant)"
        missing=$((missing + 1))
    fi
done

if [ $missing -gt 0 ]; then
    echo ""
    echo -e "${RED}Erreur: $missing fichier(s) manquant(s)${NC}"
    exit 1
fi

echo ""

echo -e "${BLUE}🔧 Étape 5: Vérification de la branche${NC}"
echo "─────────────────────────────────────────────────────────────"

if command -v git &> /dev/null; then
    current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "Branche actuelle: $current_branch"
    
    if [ "$current_branch" = "devolop" ] || [ "$current_branch" = "develop" ]; then
        echo -e "${GREEN}✓${NC} Vous êtes sur la bonne branche"
    else
        echo -e "${YELLOW}⚠${NC} Considérez de basculer sur 'devolop'"
        echo "   git checkout devolop"
    fi
else
    echo -e "${YELLOW}⚠${NC} Git non disponible"
fi

echo ""

echo -e "${BLUE}✨ Prêt pour le développement!${NC}"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1️⃣  Lancer l'API (dans un terminal):"
echo "   ${YELLOW}npm run dev:api${NC}"
echo ""
echo "2️⃣  Lancer Nuxt (dans un autre terminal):"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3️⃣  Ouvrir le navigateur:"
echo "   ${YELLOW}http://localhost:3000/dev_alt-news/subscriber${NC}"
echo ""
echo "4️⃣  Tester l'intégration:"
echo "   ${YELLOW}./verify-api.sh${NC}"
echo ""
echo "5️⃣  Consulter la documentation:"
echo "   ${YELLOW}cat composables/README.md${NC}"
echo "   ${YELLOW}cat API_SUBSCRIPTION_README.md${NC}"
echo "   ${YELLOW}cat MIGRATION_GUIDE.md${NC}"
echo ""

# Vérifier si l'API est accessible
echo -e "${BLUE}🔍 Vérification supplémentaire${NC}"
echo "─────────────────────────────────────────────────────────────"

if curl -s -f "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} API accessible à $API_URL"
else
    echo -e "${YELLOW}⚠${NC} API non accessible à $API_URL"
    echo "   Assurez-vous de lancer: npm run dev:api"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║    ✅ Environnement prêt! Bon développement 🎉                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
