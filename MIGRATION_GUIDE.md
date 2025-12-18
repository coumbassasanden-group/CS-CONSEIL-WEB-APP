# 🔄 Guide de migration - Subscription API

## Vue d'ensemble

Ce guide explique comment migrer le système d'abonnement des données locales à l'API réelle.

---

## 📋 Checklist de migration

- [ ] **API locale** - Assurez-vous que l'API est accessible à `http://localhost:3000/api/`
- [ ] **Configuration** - Vérifiez la variable d'environnement `API_SUBSCRIPTION_URL`
- [ ] **Composable** - `useSubscription()` est maintenant connecté à l'API
- [ ] **Page subscriber** - Mise à jour pour charger les plans depuis l'API
- [ ] **Tests** - Testez les appels API dans le navigateur
- [ ] **Gestion d'erreurs** - Testez les scénarios d'erreur

---

## 🔧 Mise à jour des pages existantes

### 1. Page `subscriber/manage.vue` (Gestion d'abonnement)

```vue
<script setup lang="ts">
const {
  currentSubscription,
  subscriptionLoading,
  fetchCurrentSubscription,
  renewSubscription,
  cancelSubscription,
  formatPrice
} = useSubscription()

const route = useRoute()

// Charger l'abonnement actuel au montage
onMounted(async () => {
  const userId = route.params.userId as string
  await fetchCurrentSubscription(userId)
})

// Renouveler l'abonnement
const handleRenewal = async () => {
  const success = await renewSubscription(currentSubscription.value.id, {
    paymentMethod: 'CARD'
  })
  if (success) {
    // Recharger l'abonnement
    await fetchCurrentSubscription(route.params.userId as string)
  }
}

// Annuler l'abonnement
const handleCancel = async () => {
  if (confirm('Êtes-vous sûr ?')) {
    const success = await cancelSubscription()
    if (success) {
      navigateTo('/subscriber')
    }
  }
}
</script>
```

### 2. Page `subscriber/success.vue` (Confirmation d'abonnement)

```vue
<script setup lang="ts">
const {
  currentSubscription,
  subscriptionLoading,
  fetchCurrentSubscription
} = useSubscription()

// Charger l'abonnement après redirection
onMounted(async () => {
  await fetchCurrentSubscription()
})
</script>
```

---

## 🧪 Test des endpoints

### Tester les plans

```bash
# Récupérer tous les plans
curl -X GET http://localhost:3000/api/plans \
  -H "Accept: application/json"

# Réponse attendue:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Gratuit",
      "price": 0,
      "duration": 0,
      "features": [...],
      "isActive": true
    },
    ...
  ]
}
```

### Tester la création d'abonnement

```bash
# Créer un abonnement
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "email=user@example.com" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "phone=123456789" \
  -F "planId=2"
```

### Tester l'abonnement actuel

```bash
# Récupérer l'abonnement de l'utilisateur actuel
curl -X GET http://localhost:3000/api/subscriptions/current \
  -H "Accept: application/json"

# Récupérer l'abonnement d'un utilisateur spécifique
curl -X GET http://localhost:3000/api/subscriptions/user/{userId} \
  -H "Accept: application/json"
```

---

## 🐛 Dépannage

### Erreur: "API non accessible"

```typescript
// Vérifiez la URL dans nuxt.config.ts
apiSubcriptionUrl: process.env.API_SUBSCRIPTION_URL || 'http://localhost:3000/api/',

// En développement, vérifiez que l'API est lancée:
npm run dev:api
// ou
node server.js
```

### Erreur: "Plans ne chargeant pas"

```typescript
// Vérifiez dans la console du navigateur
const { fetchPlans } = useSubscription()
const result = await fetchPlans()
console.log(result) // Devrait afficher les plans

// Vérifiez les en-têtes
// Accept: application/json
// Content-Type: application/json
```

### Erreur: "Formulaire ne se soumet pas"

```typescript
// Vérifiez la validation
const { validateForm } = useSubscription()
const isValid = validateForm()
console.log(isValid) // true/false

// Vérifiez les erreurs
const { errorMessage } = useSubscription()
console.log(errorMessage.value) // Message d'erreur détaillé
```

---

## 📝 Modèle de réponse API

### Création d'abonnement

```json
{
  "success": true,
  "data": {
    "id": "sub_123",
    "userId": "user_123",
    "planId": "plan_2",
    "status": "ACTIVE",
    "startDate": "2025-12-14T00:00:00Z",
    "endDate": "2026-01-14T00:00:00Z",
    "autoRenew": true,
    "paymentMethod": "CARD",
    "transactionId": "txn_123",
    "createdAt": "2025-12-14T10:30:00Z",
    "updatedAt": "2025-12-14T10:30:00Z"
  },
  "message": "Abonnement créé avec succès"
}
```

### Récupération de plans

```json
{
  "success": true,
  "data": [
    {
      "id": "plan_1",
      "name": "Gratuit",
      "description": "Plan gratuit avec accès limité",
      "price": "0",
      "duration": 0,
      "features": {
        "newsletter": true,
        "access": false
      },
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    ...
  ]
}
```

---

## 🚀 Intégration avec un système de paiement

### Exemple avec Stripe

```typescript
// Dans le composable useSubscription
const processPayment = async (token: string) => {
  try {
    const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...subscriptionForm.value,
        stripeToken: token
      })
    })
    
    const data = await response.json()
    return data.success
  } catch (error) {
    errorMessage.value = 'Erreur de paiement'
    return false
  }
}
```

### Exemple avec PayPal

```typescript
const createPayPalOrder = async () => {
  const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: subscriptionForm.value.planId,
      amount: getSelectedPlan.value?.price
    })
  })
  
  const data = await response.json()
  return data.orderId
}
```

---

## 📊 Monitoring et logs

### Activer les logs API

```typescript
// Dans composables/useApi.ts
const post = async <T>(endpoint: string, data: FormData | object) => {
  console.log(`[API] POST ${endpoint}`, data)
  
  try {
    const response = await fetch(...)
    console.log(`[API] Response ${response.status}`, response)
    return response.json() as Promise<T>
  } catch (error) {
    console.error(`[API] Error ${endpoint}`, error)
    throw error
  }
}
```

### Tracer les appels d'abonnement

```typescript
// Dans useSubscription.ts
const fetchPlans = async () => {
  console.log('[Subscription] Fetching plans...')
  plansLoading.value = true
  
  try {
    // ...
    console.log('[Subscription] Plans loaded:', subscriptionPlans.value)
  } catch (error) {
    console.error('[Subscription] Error loading plans:', error)
  }
}
```

---

## ✅ Validation complète

Avant de déployer en production, assurez-vous que:

- [ ] Tous les endpoints API répondent correctement
- [ ] La validation du formulaire fonctionne
- [ ] Les messages d'erreur s'affichent
- [ ] Les états de chargement s'affichent
- [ ] Le renouvellement d'abonnement fonctionne
- [ ] L'annulation d'abonnement fonctionne
- [ ] Les fichiers (justificatif étudiant) sont uploadés correctement
- [ ] La pagination fonctionne (si applicable)
- [ ] Les authentifications/tokens sont gérés (si applicable)
