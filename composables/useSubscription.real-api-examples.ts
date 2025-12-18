/**
 * Exemples d'utilisation de useSubscription avec les plans réels
 */

// ===== EXEMPLE 1: Charger les plans au montage du composant =====
export const Example1_LoadPlans = () => {
  import('~/composables/useSubscription').then(({ useSubscription }) => {
    const { subscriptionPlans, plansLoading, plansError, fetchPlans } = useSubscription()

    // Dans onMounted
    const loadPlans = async () => {
      const plans = await fetchPlans()
      console.log('Plans chargés:', plans)
      // Plans sont maintenant:
      // - price: number (9.99)
      // - features: string[] (["Accès illimité aux articles", ...])
      // - duration: number (30)
    }

    return { loadPlans }
  })
}

// ===== EXEMPLE 2: Afficher les plans dans un template Vue =====
export const Example2_TemplateUsage = `
<template>
  <div class="plans-container">
    <!-- État de chargement -->
    <div v-if="plansLoading" class="loading">
      <p>Chargement des plans...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="plansError" class="error">
      <p>{{ plansError }}</p>
      <button @click="fetchPlans">Réessayer</button>
    </div>

    <!-- Plans -->
    <div v-else class="plans-list">
      <div 
        v-for="plan in subscriptionPlans" 
        :key="plan.id"
        class="plan-card"
        @click="selectPlan(plan.id)"
      >
        <h3>{{ plan.name }}</h3>
        <p class="price">
          {{ plan.price }}€ 
          <span class="period">/ {{ plan.duration }} jours</span>
        </p>
        <p class="description">{{ plan.description }}</p>
        
        <!-- Features maintenant parsées en tableau -->
        <ul class="features">
          <li v-for="(feature, index) in plan.features" :key="index">
            ✓ {{ feature }}
          </li>
        </ul>
        
        <button 
          :disabled="!plan.isActive"
          class="select-btn"
        >
          Choisir ce plan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { subscriptionPlans, plansLoading, plansError, fetchPlans, selectPlan } = useSubscription()

onMounted(() => {
  fetchPlans()
})
</script>
`

// ===== EXEMPLE 3: Traiter les différents types de prix =====
export const Example3_PriceHandling = {
  // Avant (problématique):
  // plan.price: "9.99" (string)
  // Prix comparaison: "9.99" > "100" = true! (comparaison string)
  // Affichage: "Prix: 9.99" (correct par chance)

  // Après (correct):
  // plan.price: 9.99 (number)
  // Prix comparaison: 9.99 > 100 = false (comparaison numérique correcte)
  // Affichage: "Prix: 9.99€" (type-safe)

  comparePrice: (price1: number, price2: number): boolean => {
    return price1 > price2 // Maintenant garantissant numérique
  },

  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  },

  discount: (originalPrice: number, discountPercent: number): number => {
    return originalPrice * (1 - discountPercent / 100) // Numérique
  }
}

// ===== EXEMPLE 4: Valider les features =====
export const Example4_FeaturesValidation = {
  // Avant: features = "[\"Feature 1\", \"Feature 2\"]" (string)
  // Problème: Pas possible d'itérer directement
  // this.plan.features.map(f => ...) // ERREUR!

  // Après: features = ["Feature 1", "Feature 2"] (array)
  // Maintenant possible:
  
  countFeatures: (plan: any): number => {
    return plan.features.length // Array methods work!
  },

  hasFeature: (plan: any, featureName: string): boolean => {
    return plan.features.includes(featureName)
  },

  displayFeatures: (plan: any): string => {
    return plan.features.join(', ')
  },

  filterPlansByFeature: (plans: any[], feature: string): any[] => {
    return plans.filter(plan => plan.features.includes(feature))
  }
}

// ===== EXEMPLE 5: Sélectionner et valider un plan =====
export const Example5_SelectAndValidate = {
  selectPlan: function(planId: string | number) {
    // selectPlan accepte maintenant string | number
    // Convertit automatiquement en string (format UUID)
    // const subscription = useSubscription()
    // subscription.selectPlan(planId)
  },

  getSelectedPlanInfo: function() {
    // const { getSelectedPlan } = useSubscription()
    // const selected = getSelectedPlan.value
    // Retourne null ou le plan complet avec tous les types corrects
    // selected.price → number
    // selected.features → string[]
    // selected.duration → number
  },

  validatePlan: function(plan: any): boolean {
    // Validations now type-safe:
    const hasValidPrice = typeof plan.price === 'number' && plan.price >= 0
    const hasFeatures = Array.isArray(plan.features) && plan.features.length > 0
    const hasValidDuration = typeof plan.duration === 'number' && plan.duration > 0

    return hasValidPrice && hasFeatures && hasValidDuration
  }
}

// ===== EXEMPLE 6: Créer un abonnement après sélection =====
export const Example6_CreateSubscription = async () => {
  // const { subscriptionForm, createSubscription, getSelectedPlan } = useSubscription()

  // 1. Vérifier que planId est un string (UUID)
  // subscriptionForm.value.planId = "a4b34a9f-95e2-447b-9d9f-73028853f2fb" ✓

  // 2. Remplir le formulaire
  // subscriptionForm.value.email = "user@example.com"
  // subscriptionForm.value.firstName = "Jean"
  // subscriptionForm.value.lastName = "Dupont"

  // 3. Créer l'abonnement
  // const success = await createSubscription()

  // 4. Dans l'API, le payload sera:
  // {
  //   planId: "a4b34a9f-95e2-447b-9d9f-73028853f2fb",
  //   email: "user@example.com",
  //   firstName: "Jean",
  //   lastName: "Dupont",
  //   ...
  // }
}

// ===== EXEMPLE 7: Affichage avancé avec comparaison de prix =====
export const Example7_AdvancedDisplay = `
<template>
  <div class="plans-comparison">
    <div v-for="plan in subscriptionPlans" :key="plan.id">
      <div class="plan-header">
        <h3>{{ plan.name }}</h3>
        <span v-if="plan.price === 0" class="badge-free">GRATUIT</span>
        <span v-else-if="isMostPopular(plan.price)" class="badge-popular">
          Meilleur rapport qualité-prix
        </span>
      </div>

      <div class="plan-price">
        <!-- Maintenant price est un nombre, formatage garantisseur -->
        <strong class="amount">{{ formatPrice(plan.price) }}</strong>
        <span class="period">/ {{ plan.duration }} jours</span>
      </div>

      <div class="plan-features">
        <!-- Features est maintenant un tableau, itération sûre -->
        <div v-for="(feature, i) in plan.features" :key="i" class="feature">
          <span class="icon">✓</span>
          <span>{{ feature }}</span>
        </div>
      </div>

      <button 
        @click="selectAndValidate(plan)"
        :class="{ 'is-selected': isSelected(plan.id) }"
      >
        {{ isSelected(plan.id) ? 'Plan sélectionné' : 'Sélectionner' }}
      </button>
    </div>
  </div>
</template>
`

// ===== EXEMPLE 8: Gestion des cas limites =====
export const Example8_EdgeCases = {
  // Ces cas sont maintenant gérés automatiquement:

  // Cas 1: Plan sans features (array vide)
  handleMissingFeatures: (plan: any) => {
    if (plan.features.length === 0) {
      console.log('Plan sans features')
    }
  },

  // Cas 2: Prix zéro (plan gratuit)
  isFreePlan: (plan: any) => {
    return plan.price === 0 // Comparaison numérique correcte
  },

  // Cas 3: Durée courte vs longue
  getPlanType: (plan: any) => {
    if (plan.duration <= 30) return 'MONTHLY'
    if (plan.duration <= 180) return 'QUARTERLY'
    if (plan.duration >= 365) return 'ANNUAL'
    return 'CUSTOM'
  },

  // Cas 4: Validation complète
  isValidPlan: (plan: any): boolean => {
    return (
      plan.id && typeof plan.id === 'string' &&
      plan.name && typeof plan.name === 'string' &&
      plan.price !== undefined && typeof plan.price === 'number' &&
      Array.isArray(plan.features) &&
      plan.duration !== undefined && typeof plan.duration === 'number' &&
      plan.isActive === true
    )
  }
}

// ===== DIAGNOSTIC: Vérifier les données en console =====
export const Example9_Debugging = () => {
  // Dans la console du navigateur après fetchPlans():
  const checkPlans = (subscriptionPlans: any[]) => {
    // const { subscriptionPlans } = useSubscription()

    subscriptionPlans.forEach((plan: any, index: number) => {
      console.group(`Plan ${index + 1}: ${plan.name}`)
      console.log('ID:', plan.id, '(type:', typeof plan.id, ')')
      console.log('Prix:', plan.price, '(type:', typeof plan.price, ')')
      console.log('Durée:', plan.duration, '(type:', typeof plan.duration, ')')
      console.log('Features:', plan.features, '(type:', typeof plan.features, ')')
      console.log('Features count:', plan.features.length)
      console.groupEnd()
    })
  }

  // Copier-coller dans la console et exécuter:
  // checkPlans()
}

export default {
  Example1_LoadPlans,
  Example2_TemplateUsage,
  Example3_PriceHandling,
  Example4_FeaturesValidation,
  Example5_SelectAndValidate,
  Example6_CreateSubscription,
  Example7_AdvancedDisplay,
  Example8_EdgeCases,
  Example9_Debugging
}
