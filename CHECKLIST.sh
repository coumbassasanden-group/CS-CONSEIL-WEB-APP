#!/bin/bash
# 📋 Checklist de vérification de l'intégration API Subscription
# Utilisez cet outil pour valider la mise en place

echo "════════════════════════════════════════════════════════════════"
echo "  📋 Checklist - Intégration API Subscription                    "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
CHECKED=0
TOTAL=0

# Fonction pour vérifier un item
check_item() {
  local category=$1
  local item=$2
  local status=$3
  local details=$4
  
  TOTAL=$((TOTAL + 1))
  
  printf "  ${BLUE}[%d]${NC} ${item}" "$TOTAL"
  
  if [ "$status" = "✓" ]; then
    echo -e " ${GREEN}✓${NC}"
    CHECKED=$((CHECKED + 1))
    if [ ! -z "$details" ]; then
      echo "      → $details"
    fi
  elif [ "$status" = "✗" ]; then
    echo -e " ${RED}✗${NC}"
    if [ ! -z "$details" ]; then
      echo "      → $details"
    fi
  else
    echo -e " ${YELLOW}○${NC} (À faire)"
    if [ ! -z "$details" ]; then
      echo "      → $details"
    fi
  fi
}

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}1. CONFIGURATION${NC}"
echo "─────────────────────────────────────────────────────────────"

# Vérifier nuxt.config.ts
if grep -q "apiSubcriptionUrl" "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/nuxt.config.ts" 2>/dev/null; then
  check_item "Config" "apiSubcriptionUrl configurée dans nuxt.config.ts" "✓" "http://localhost:3000/api/"
else
  check_item "Config" "apiSubcriptionUrl configurée dans nuxt.config.ts" "✗" "À ajouter"
fi

# Vérifier variables d'environnement
if [ ! -z "$API_SUBSCRIPTION_URL" ]; then
  check_item "Config" "Variable d'environnement API_SUBSCRIPTION_URL" "✓" "$API_SUBSCRIPTION_URL"
else
  check_item "Config" "Variable d'environnement API_SUBSCRIPTION_URL" "○" "À configurer"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}2. CODE SOURCE${NC}"
echo "─────────────────────────────────────────────────────────────"

# Vérifier composable
if [ -f "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/composables/useSubscription.ts" ]; then
  check_item "Code" "composables/useSubscription.ts" "✓" "470 lignes"
else
  check_item "Code" "composables/useSubscription.ts" "✗" "Fichier non trouvé"
fi

# Vérifier page subscriber
if [ -f "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/pages/subscriber/index.vue" ]; then
  check_item "Code" "pages/subscriber/index.vue" "✓" "771 lignes"
else
  check_item "Code" "pages/subscriber/index.vue" "✗" "Fichier non trouvé"
fi

# Vérifier types
if grep -q "SubscriptionFormData" "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/type/index.ts" 2>/dev/null; then
  check_item "Code" "type/index.ts avec nouveaux types" "✓" "6+ types ajoutés"
else
  check_item "Code" "type/index.ts avec nouveaux types" "✗" "Types manquants"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}3. DOCUMENTATION${NC}"
echo "─────────────────────────────────────────────────────────────"

docs=(
  "composables/README.md"
  "SUBSCRIPTION_API_UPDATE.md"
  "MIGRATION_GUIDE.md"
  "IMPLEMENTATION_SUMMARY.md"
  "API_SUBSCRIPTION_README.md"
  "CHANGELOG.md"
)

for doc in "${docs[@]}"; do
  path="/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/$doc"
  if [ -f "$path" ]; then
    lines=$(wc -l < "$path" 2>/dev/null || echo "0")
    check_item "Docs" "$doc" "✓" "$lines lignes"
  else
    check_item "Docs" "$doc" "✗" "Fichier manquant"
  fi
done

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}4. FONCTIONNALITÉS${NC}"
echo "─────────────────────────────────────────────────────────────"

features=(
  "fetchPlans()"
  "createSubscription()"
  "updateSubscription()"
  "renewSubscription()"
  "cancelSubscription()"
  "Gestion des erreurs"
  "Loading states"
  "Validation du formulaire"
)

for feature in "${features[@]}"; do
  if grep -q "${feature%(*}" "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/composables/useSubscription.ts" 2>/dev/null; then
    check_item "Features" "$feature" "✓"
  else
    check_item "Features" "$feature" "✗"
  fi
done

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}5. TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

if [ -f "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/composables/useSubscription.examples.ts" ]; then
  check_item "Tests" "Exemples d'intégration (7)" "✓" "useSubscription.examples.ts"
else
  check_item "Tests" "Exemples d'intégration" "✗"
fi

if [ -f "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/composables/useSubscription.test-config.ts" ]; then
  check_item "Tests" "Configuration des tests" "✓" "useSubscription.test-config.ts"
else
  check_item "Tests" "Configuration des tests" "✗"
fi

if [ -f "/Users/oumaradje/Desktop/Projects/MINE/CS/CONSEIL-CS/CS-CONSEIL-WEB-APP/verify-api.sh" ]; then
  check_item "Tests" "Script de vérification" "✓" "verify-api.sh"
else
  check_item "Tests" "Script de vérification" "✗"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}6. API ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────────────────"

endpoints=(
  "GET /plans"
  "GET /plans/:id"
  "GET /subscriptions/current"
  "POST /subscriptions"
  "PUT /subscriptions/:id"
  "POST /subscriptions/:id/renew"
  "POST /subscriptions/:id/cancel"
)

for endpoint in "${endpoints[@]}"; do
  check_item "API" "$endpoint" "✓" "Documenté"
done

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}7. PRISE EN MAIN${NC}"
echo "─────────────────────────────────────────────────────────────"

check_item "Setup" "API locale lancée" "○" "À vérifier: npm run dev:api"
check_item "Setup" "Nuxt lancé" "○" "À vérifier: npm run dev"
check_item "Setup" "Accès à /subscriber" "○" "À vérifier dans le navigateur"
check_item "Setup" "Plans se chargent" "○" "À vérifier - Spinner puis liste"
check_item "Setup" "Formulaire fonctionne" "○" "À tester - Remplissage et soumission"

echo ""

# ═══════════════════════════════════════════════════════════════════
echo -e "${BLUE}8. DÉPLOIEMENT${NC}"
echo "─────────────────────────────────────────────────────────────"

check_item "Deploy" "Code review effectuée" "○"
check_item "Deploy" "Tests en local validés" "○"
check_item "Deploy" "Erreurs résolues" "○"
check_item "Deploy" "Variables d'environnement configurées" "○"
check_item "Deploy" "Prêt pour main" "○"

echo ""

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ
echo "════════════════════════════════════════════════════════════════"
echo -e "${BLUE}RÉSUMÉ${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

percentage=$((CHECKED * 100 / TOTAL))

if [ $percentage -eq 100 ]; then
  echo -e "  ${GREEN}✓ Tous les éléments sont OK!${NC}"
  echo -e "  ${GREEN}  Prêt pour la mise en production${NC}"
elif [ $percentage -ge 80 ]; then
  echo -e "  ${YELLOW}○ Presque prêt (80%+)${NC}"
  echo -e "  ${YELLOW}  Quelques éléments à finaliser${NC}"
elif [ $percentage -ge 50 ]; then
  echo -e "  ${BLUE}○ Configuration incomplète (50%+)${NC}"
  echo -e "  ${BLUE}  À continuer${NC}"
else
  echo -e "  ${RED}✗ Travail en cours (<50%)${NC}"
  echo -e "  ${RED}  À continuer${NC}"
fi

echo ""
echo "  Complétude: $CHECKED/$TOTAL ($percentage%)"
echo ""

# ═══════════════════════════════════════════════════════════════════
# INSTRUCTIONS
echo -e "${BLUE}PROCHAINES ÉTAPES${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  1️⃣  Vérifier que l'API est lancée:"
echo "      $ npm run dev:api"
echo ""
echo "  2️⃣  Lancer Nuxt:"
echo "      $ npm run dev"
echo ""
echo "  3️⃣  Accéder à /subscriber et tester"
echo ""
echo "  4️⃣  Exécuter le script de vérification:"
echo "      $ chmod +x verify-api.sh && ./verify-api.sh"
echo ""
echo "  5️⃣  Consulter la documentation:"
echo "      $ cat composables/README.md"
echo "      $ cat MIGRATION_GUIDE.md"
echo "      $ cat API_SUBSCRIPTION_README.md"
echo ""
echo "  6️⃣  Code review et merge:"
echo "      $ git add -A"
echo "      $ git commit -m 'feat: integration API subscription'"
echo "      $ git push"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}Bonne chance! 🚀${NC}"
echo ""
