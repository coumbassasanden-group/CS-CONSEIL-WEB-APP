/**
 * Exemple d'intégration API pour les abonnements
 * Ce fichier montre comment utiliser le composable useSubscription avec l'API réelle
 */

// ============================================
// EXEMPLE 1: Page d'abonnement complète
// ============================================

/**
 * Fichier: pages/subscriber/index.vue
 */

/*
<template>
  <div class="subscriber-page">
    <!-- Section Hero avec loading -->
    <section class="hero-section" v-if="!plansLoading">
      <!-- ... contenu existant ... -->
    </section>

    <!-- Loading spinner -->
    <div v-if="plansLoading" class="loading-spinner">
      Chargement des plans...
    </div>

    <!-- Plans Section -->
    <section v-if="!plansLoading && subscriptionPlans.length > 0" class="plans-section">
      <div class="pricing-grid">
        <PricingCard
          v-for="plan in subscriptionPlans"
          :key="plan.id"
          :plan="plan"
          :is-selected="subscriptionForm.planId === plan.id"
          @select="handlePlanSelect"
        />
      </div>
      <div v-if="plansError" class="error-banner">
        {{ plansError }}
      </div>
    </section>

    <!-- Erreur de chargement -->
    <div v-if="plansLoading === false && subscriptionPlans.length === 0" class="error-state">
      <p>Impossible de charger les plans d'abonnement.</p>
      <button @click="retryLoadPlans">Réessayer</button>
    </div>

    <!-- Form Section -->
    <section v-if="subscriptionForm.planId" class="form-section">
      <div class="container-small">
        <SubscriptionForm
          :form-data="subscriptionForm"
          :selected-plan="getSelectedPlan"
          :is-processing="isProcessing"
          :error="errorMessage"
          @submit="handleSubmit"
        />
      </div>
    </section>

    <!-- Payment Modal -->
    <PaymentAlert
      :is-visible="showPaymentModal"
      :type="paymentModalType"
      :title="paymentModalTitle"
      :message="paymentModalMessage"
      :progress="paymentProgress"
      @close="closePaymentModal"
      @confirm="handlePaymentConfirm"
      @retry="handlePaymentRetry"
    />
  </div>
</template>

<script setup lang="ts">
const {
  subscriptionPlans,
  subscriptionForm,
  isProcessing,
  errorMessage,
  plansLoading,
  plansError,
  getSelectedPlan,
  selectPlan,
  fetchPlans,
  processSubscription,
  resetForm
} = useSubscription()

// État local pour la modal
const showPaymentModal = ref(false)
const paymentModalType = ref<'success' | 'error' | 'processing'>('processing')
const paymentModalTitle = ref('')
const paymentModalMessage = ref('')
const paymentProgress = ref(0)

// Charger les plans au montage
onMounted(async () => {
  await fetchPlans()
})

// Recharger les plans
const retryLoadPlans = async () => {
  await fetchPlans()
}

// Sélection de plan
const handlePlanSelect = (planId: number) => {
  selectPlan(planId)
  nextTick(() => {
    const formSection = document.querySelector('.form-section')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// Soumission du formulaire
const handleSubmit = async () => {
  showPaymentModal.value = true
  paymentModalType.value = 'processing'
  paymentModalTitle.value = 'Traitement du paiement'
  paymentModalMessage.value = 'Veuillez patienter...'
  paymentProgress.value = 0

  const success = await processSubscription()

  if (success) {
    paymentModalType.value = 'success'
    paymentModalTitle.value = 'Paiement réussi !'
    paymentModalMessage.value = 'Votre abonnement a été activé avec succès.'
    paymentProgress.value = 100

    await new Promise(resolve => setTimeout(resolve, 1500))
    navigateTo('/subscriber/success')
  } else {
    paymentModalType.value = 'error'
    paymentModalTitle.value = 'Erreur de paiement'
    paymentModalMessage.value = errorMessage.value || 'Une erreur est survenue.'
  }
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  paymentProgress.value = 0
}

const handlePaymentConfirm = () => {
  closePaymentModal()
}

const handlePaymentRetry = () => {
  closePaymentModal()
  handleSubmit()
}
</script>
*/

// ============================================
// EXEMPLE 2: Récupérer les plans au démarrage
// ============================================

/*
// Dans un middleware ou un hook
export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchPlans } = useSubscription()
  
  try {
    await fetchPlans()
    console.log('Plans d\'abonnement chargés')
  } catch (error) {
    console.error('Erreur lors du chargement des plans:', error)
  }
})
*/

// ============================================
// EXEMPLE 3: Afficher l'abonnement actuel
// ============================================

/*
<template>
  <div v-if="currentSubscription" class="subscription-info">
    <h2>Votre abonnement actif</h2>
    <p v-if="currentSubscription.isActive" class="status active">
      ✓ Actif
    </p>
    <p v-else class="status inactive">
      ✗ Inactif
    </p>
    
    <div class="details">
      <p><strong>Plan:</strong> {{ currentSubscription.plan.name }}</p>
      <p><strong>Prix:</strong> {{ formatPrice(currentSubscription.plan.price) }}</p>
      <p v-if="currentSubscription.startDate">
        <strong>Début:</strong> {{ new Date(currentSubscription.startDate).toLocaleDateString('fr-FR') }}
      </p>
      <p v-if="currentSubscription.endDate">
        <strong>Expire le:</strong> {{ new Date(currentSubscription.endDate).toLocaleDateString('fr-FR') }}
      </p>
      <p v-if="currentSubscription.autoRenew">
        <strong>Renouvellement automatique:</strong> Activé
      </p>
    </div>

    <button v-if="currentSubscription.isActive" @click="handleCancelSubscription">
      Annuler l'abonnement
    </button>
  </div>
  <div v-else>
    <p>Aucun abonnement actif</p>
    <NuxtLink to="/subscriber">S'abonner maintenant</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const {
  currentSubscription,
  subscriptionLoading,
  fetchCurrentSubscription,
  cancelSubscription,
  formatPrice
} = useSubscription()

const route = useRoute()
const userId = route.params.userId

onMounted(async () => {
  // Récupérer l'abonnement actuel
  await fetchCurrentSubscription(userId as string)
})

const handleCancelSubscription = async () => {
  if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
    const success = await cancelSubscription()
    if (success) {
      await fetchCurrentSubscription(userId as string)
    }
  }
}
</script>
*/

// ============================================
// EXEMPLE 4: Gestion d'erreurs avancée
// ============================================

/*
<template>
  <div>
    <!-- Erreur de chargement des plans -->
    <div v-if="plansError" class="alert alert-error">
      <p>{{ plansError }}</p>
      <button @click="retryFetchPlans">Réessayer</button>
    </div>

    <!-- Erreur lors de la création d'abonnement -->
    <div v-if="errorMessage && processingStep === 'payment'" class="alert alert-error">
      <p>{{ errorMessage }}</p>
      <p class="hint">Veuillez vérifier vos informations et réessayer.</p>
    </div>

    <!-- Erreur lors de la récupération de l'abonnement -->
    <div v-if="subscriptionError" class="alert alert-error">
      <p>{{ subscriptionError }}</p>
      <button @click="retryFetchSubscription">Réessayer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  plansError,
  subscriptionError,
  errorMessage,
  processingStep,
  fetchPlans,
  fetchCurrentSubscription
} = useSubscription()

const retryFetchPlans = async () => {
  await fetchPlans()
}

const retryFetchSubscription = async () => {
  await fetchCurrentSubscription()
}
</script>
*/

// ============================================
// EXEMPLE 5: Renouvellement d'abonnement
// ============================================

/*
<template>
  <div v-if="currentSubscription" class="renewal-section">
    <p v-if="isSubscriptionExpiring" class="warning">
      ⚠️ Votre abonnement expire le {{ expirationDate }}
    </p>

    <button
      v-if="currentSubscription.isActive && canRenew"
      @click="handleRenewal"
      :disabled="isProcessing"
    >
      {{ isProcessing ? 'Renouvellement en cours...' : 'Renouveler l\'abonnement' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const {
  currentSubscription,
  isProcessing,
  renewSubscription
} = useSubscription()

const expirationDate = computed(() => {
  if (!currentSubscription.value?.endDate) return ''
  return new Date(currentSubscription.value.endDate).toLocaleDateString('fr-FR')
})

const isSubscriptionExpiring = computed(() => {
  if (!currentSubscription.value?.endDate) return false
  const daysUntilExpiration = Math.ceil(
    (new Date(currentSubscription.value.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  return daysUntilExpiration <= 30
})

const canRenew = computed(() => {
  return currentSubscription.value?.isActive && currentSubscription.value?.endDate
})

const handleRenewal = async () => {
  const success = await renewSubscription(currentSubscription.value.id, {
    paymentMethod: 'CARD', // Adapter selon vos moyens de paiement
  })

  if (success) {
    // Recharger l'abonnement
    const { fetchCurrentSubscription } = useSubscription()
    await fetchCurrentSubscription()
  }
}
</script>
*/

// ============================================
// EXEMPLE 6: Store Pinia pour l'abonnement
// ============================================

/*
// stores/subscription.ts
import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore('subscription', () => {
  const {
    currentSubscription,
    subscriptionLoading,
    subscriptionError,
    fetchCurrentSubscription
  } = useSubscription()

  const isSubscriptionActive = computed(() => currentSubscription.value?.isActive ?? false)

  const loadSubscription = async (userId?: string) => {
    await fetchCurrentSubscription(userId)
  }

  return {
    currentSubscription,
    subscriptionLoading,
    subscriptionError,
    isSubscriptionActive,
    loadSubscription
  }
})

// Usage dans un composant
const subscriptionStore = useSubscriptionStore()
const isActive = subscriptionStore.isSubscriptionActive

onMounted(() => {
  subscriptionStore.loadSubscription()
})
*/

// ============================================
// EXEMPLE 7: Middleware de protection
// ============================================

/*
// middleware/requireSubscription.ts
export default defineRouteMiddleware(async (to, from) => {
  const { currentSubscription, fetchCurrentSubscription } = useSubscription()

  if (!currentSubscription.value) {
    await fetchCurrentSubscription()
  }

  if (!currentSubscription.value?.isActive) {
    return navigateTo('/subscriber')
  }
})

// Usage dans une page
<script setup lang="ts">
definePageMeta({
  middleware: 'requireSubscription'
})
</script>
*/

export {}
