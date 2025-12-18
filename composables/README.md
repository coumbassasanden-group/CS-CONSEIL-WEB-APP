# Composables Documentation

## `useSubscription()`

Composable pour gérer les abonnements et plans d'ALT News.

### Configuration API

**Base URL :** `http://localhost:3000/api/`

**Endpoints :**
- `GET /plans` - Récupérer tous les plans
- `GET /plans/:id` - Récupérer un plan spécifique
- `GET /subscriptions/current` - Récupérer l'abonnement actuel de l'utilisateur
- `GET /subscriptions/user/:userId` - Récupérer l'abonnement d'un utilisateur
- `POST /subscriptions` - Créer un nouvel abonnement
- `PUT /subscriptions/:id` - Mettre à jour un abonnement
- `POST /subscriptions/:id/renew` - Renouveler un abonnement
- `POST /subscriptions/:id/cancel` - Annuler un abonnement

### État (Data)

```typescript
// Plans d'abonnement
subscriptionPlans: Ref<any[]>

// Abonnement actuel de l'utilisateur
currentSubscription: Ref<any>

// Formulaire d'abonnement
subscriptionForm: Ref<{
  planId: number | null
  email: string
  firstName: string
  lastName: string
  company: string
  phone: string
  studentProof: File | null
  acceptTerms: boolean
  newsletter: boolean
}>

// Témoignages clients (données locales)
testimonials: Ref<any[]>

// FAQ (données locales)
faqs: Ref<any[]>

// Statistiques
stats: Ref<{
  subscribers: string
  editions: string
  satisfaction: string
  years: string
}>
```

### États de chargement et erreurs

```typescript
// État des plans
plansLoading: Ref<boolean>
plansError: Ref<string>

// État des abonnements
subscriptionLoading: Ref<boolean>
subscriptionError: Ref<string>

// État général
isProcessing: Ref<boolean>
processingStep: Ref<'form' | 'payment' | 'confirmation'>
errorMessage: Ref<string>
```

### Méthodes API

#### Récupérer les plans

```typescript
// Récupérer tous les plans
const plans = await fetchPlans()

// Récupérer un plan spécifique
const plan = await fetchPlan(planId)
```

#### Gérer les abonnements

```typescript
// Récupérer l'abonnement actuel
const subscription = await fetchCurrentSubscription()
// ou
const subscription = await fetchCurrentSubscription(userId)

// Créer un nouvel abonnement
const success = await createSubscription(subscriptionData)

// Mettre à jour un abonnement
const success = await updateSubscription(subscriptionId, updateData)

// Renouveler un abonnement
const success = await renewSubscription(subscriptionId, paymentData)

// Annuler un abonnement (wrapper)
const success = await cancelSubscription()

// Annuler un abonnement (API direct)
const success = await cancelSubscriptionAPI(subscriptionId)
```

### Méthodes utilitaires

```typescript
// Sélectionner un plan
selectPlan(planId: number)

// Plan sélectionné (computed)
const selectedPlan = getSelectedPlan // Ref<any | null>

// Valider le formulaire
const isValid = validateForm(): boolean

// Traiter l'abonnement
const success = await processSubscription(): Promise<boolean>

// Réinitialiser le formulaire
resetForm()

// Formater le prix
const formattedPrice = formatPrice(price, currency)
// Exemples:
// formatPrice(2000, 'FCFA') => '2 000 FCFA'
// formatPrice(0, 'FCFA') => 'Gratuit'
```

### Exemple d'utilisation

```vue
<template>
  <div class="subscription">
    <!-- Afficher les plans -->
    <div v-for="plan in subscriptionPlans" :key="plan.id" class="plan-card">
      <h3>{{ plan.name }}</h3>
      <p class="price">{{ formatPrice(plan.price, plan.currency) }}</p>
      <button @click="selectPlan(plan.id)">Sélectionner</button>
    </div>

    <!-- Formulaire d'abonnement -->
    <form v-if="getSelectedPlan" @submit.prevent="handleSubmit">
      <input v-model="subscriptionForm.email" type="email" required />
      <input v-model="subscriptionForm.firstName" type="text" required />
      <input v-model="subscriptionForm.lastName" type="text" required />
      <label>
        <input v-model="subscriptionForm.acceptTerms" type="checkbox" required />
        J'accepte les conditions générales
      </label>
      <button type="submit" :disabled="isProcessing">
        {{ isProcessing ? 'Traitement...' : 'S\'abonner' }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const {
  subscriptionPlans,
  subscriptionForm,
  isProcessing,
  errorMessage,
  getSelectedPlan,
  selectPlan,
  processSubscription,
  formatPrice,
  fetchPlans
} = useSubscription()

// Charger les plans au montage
onMounted(async () => {
  await fetchPlans()
})

// Gérer la soumission
const handleSubmit = async () => {
  const success = await processSubscription()
  if (success) {
    navigateTo('/subscriber/success')
  }
}
</script>
```

### Notes importantes

1. **Format FormData** : Pour `createSubscription`, le composable crée automatiquement un `FormData` pour supporter les fichiers (justificatif étudiant).

2. **Gestion des erreurs** : Tous les appels API définissent `errorMessage` en cas d'erreur.

3. **États de chargement** : Utilisez `plansLoading` et `subscriptionLoading` pour afficher des spinners de chargement.

4. **Validation du formulaire** : Toujours appeler `validateForm()` avant `processSubscription()`.

5. **Configuration** : L'URL de base est définie dans `nuxt.config.ts` :
   ```typescript
   apiSubcriptionUrl: process.env.API_SUBSCRIPTION_URL || 'http://localhost:3000/api/',
   ```

### Types TypeScript

Les types sont définis dans `type/index.ts` :
- `Plan` - Interface pour les plans
- `Subscription` - Interface pour les abonnements
- `SubscriptionWithRelations` - Abonnement avec relations
- `CreatePlanDto` - DTO pour créer un plan
- `CreateSubscriptionDto` - DTO pour créer un abonnement
- `UpdateSubscriptionDto` - DTO pour mettre à jour un abonnement
- `RenewSubscriptionDto` - DTO pour renouveler un abonnement
