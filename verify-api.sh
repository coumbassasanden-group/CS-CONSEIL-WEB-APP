#!/bin/bash
# Script de vérification de l'intégration API
# Utilisez: chmod +x verify-api.sh && ./verify-api.sh

echo "🔍 Vérification de l'intégration API Subscription"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:3000/api"
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction pour tester un endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  
  echo -n "Testing $method $endpoint... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  status=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [[ $status =~ ^[2]+ ]]; then
    echo -e "${GREEN}✓ ($status)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Response: $(echo "$body" | jq -r '.message // .data[0].name // .')" 2>/dev/null || true
  else
    echo -e "${RED}✗ ($status)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "  Response: $body"
  fi
  echo ""
}

# 1. Vérifier que l'API est accessible
echo "📡 Étape 1: Vérification de la connexion API"
echo "-------------------------------------------"
if curl -s -f "$API_URL/plans" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API accessible${NC}"
else
  echo -e "${RED}✗ API non accessible à $API_URL${NC}"
  echo "  Assurez-vous que le serveur API est lancé:"
  echo "  npm run dev:api"
  exit 1
fi
echo ""

# 2. Tester les endpoints
echo "🧪 Étape 2: Test des endpoints"
echo "------------------------------"

# GET /plans
test_endpoint "GET" "/plans" "" "200"

# Créer un abonnement test
echo -n "Testing POST /subscriptions... "
subscription_data='
{
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+33612345678",
  "planId": 1,
  "newsletter": true
}
'
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/subscriptions" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "$subscription_data")
status=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

if [[ $status =~ ^[2] ]]; then
  echo -e "${GREEN}✓ ($status)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  subscription_id=$(echo "$body" | jq -r '.data.id' 2>/dev/null || echo "unknown")
  echo "  Created subscription: $subscription_id"
else
  echo -e "${RED}✗ ($status)${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  subscription_id="test"
fi
echo ""

# 3. Vérifier les fichiers modifiés
echo "📝 Étape 3: Vérification des fichiers modifiés"
echo "----------------------------------------------"

files_to_check=(
  "composables/useSubscription.ts"
  "pages/subscriber/index.vue"
  "type/index.ts"
  "composables/README.md"
  "SUBSCRIPTION_API_UPDATE.md"
  "MIGRATION_GUIDE.md"
  "IMPLEMENTATION_SUMMARY.md"
)

for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
done
echo ""

# 4. Vérifier la syntaxe TypeScript
echo "🔧 Étape 4: Vérification de la syntaxe"
echo "--------------------------------------"
if command -v npx &> /dev/null; then
  if npx tsc --noEmit composables/useSubscription.ts 2>/dev/null; then
    echo -e "${GREEN}✓ Syntaxe TypeScript valide${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${YELLOW}⚠ Syntaxe TypeScript - À vérifier${NC}"
  fi
else
  echo -e "${YELLOW}⚠ TypeScript compiler non trouvé${NC}"
fi
echo ""

# 5. Résumé
echo "📊 Résumé"
echo "--------"
echo -e "Tests réussis: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests échoués: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Toutes les vérifications sont passées!${NC}"
  exit 0
else
  echo -e "${RED}✗ Certaines vérifications ont échoué${NC}"
  exit 1
fi
