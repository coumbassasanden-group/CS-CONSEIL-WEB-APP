/**
 * Configuration des tests locaux pour l'API Subscription
 * Utilisez ce fichier pour tester les endpoints avec des données mockées
 */

// ============================================
// DONNÉES DE TEST - Plans
// ============================================

export const MOCK_PLANS = [
  {
    id: "1",
    name: "Gratuit",
    description: "Plan gratuit avec accès limité",
    price: "0",
    currency: "FCFA",
    duration: 0,
    period: "free",
    features: {
      newsletter: true,
      premiumAccess: false
    },
    isActive: true,
    color: "gray",
    popular: false,
    icon: "📧",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Premium - Mensuel",
    description: "Accès complet pendant 1 mois",
    price: "2000",
    currency: "FCFA",
    duration: 30,
    period: "month",
    features: {
      newsletter: true,
      premiumAccess: true,
      monthlyEdition: true
    },
    isActive: true,
    color: "blue",
    popular: false,
    icon: "📰",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    name: "Premium - Annuel",
    description: "Accès complet pendant 1 an",
    price: "20000",
    currency: "FCFA",
    duration: 365,
    period: "year",
    features: {
      newsletter: true,
      premiumAccess: true,
      monthlyEditions: true,
      support: true
    },
    isActive: true,
    color: "purple",
    popular: true,
    icon: "⭐",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// ============================================
// DONNÉES DE TEST - Abonnements
// ============================================

export const MOCK_SUBSCRIPTION = {
  id: "sub_123",
  userId: "user_456",
  planId: "3",
  status: "ACTIVE",
  startDate: new Date("2025-12-01"),
  endDate: new Date("2026-12-01"),
  autoRenew: true,
  paymentMethod: "CARD",
  transactionId: "txn_789",
  createdAt: new Date(),
  updatedAt: new Date()
}

// ============================================
// MOCK SERVER - Pour développement local
// ============================================

/**
 * Script pour démarrer un serveur mocké local
 * Exécutez: npm run dev:mock-api
 */

export const mockApiSetup = () => {
  // Intercepter les requêtes fetch pour les endpoints d'abonnement
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    // Plans - GET /api/plans
    if (url.includes('/api/plans') && init?.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          data: MOCK_PLANS
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Plan détail - GET /api/plans/:id
    if (url.match(/\/api\/plans\/\d+$/) && init?.method === 'GET') {
      const planId = url.split('/').pop()
      const plan = MOCK_PLANS.find(p => p.id === planId)
      
      return new Response(
        JSON.stringify({
          success: true,
          data: plan || null
        }),
        { status: plan ? 200 : 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Abonnements - POST /api/subscriptions
    if (url.includes('/api/subscriptions') && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...MOCK_SUBSCRIPTION,
            id: `sub_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          message: 'Abonnement créé avec succès'
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Abonnement actuel - GET /api/subscriptions/current
    if (url.includes('/api/subscriptions/current') && init?.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          data: MOCK_SUBSCRIPTION
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Renouvellement - POST /api/subscriptions/:id/renew
    if (url.match(/\/api\/subscriptions\/\w+\/renew$/) && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...MOCK_SUBSCRIPTION,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          message: 'Abonnement renouvelé avec succès'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Annulation - POST /api/subscriptions/:id/cancel
    if (url.match(/\/api\/subscriptions\/\w+\/cancel$/) && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            ...MOCK_SUBSCRIPTION,
            status: 'CANCELLED',
            updatedAt: new Date()
          },
          message: 'Abonnement annulé avec succès'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fallback - API réelle
    return originalFetch(input, init)
  }
}

// ============================================
// TESTS UNITAIRES
// ============================================

/**
 * Exemple de tests avec Vitest
 * À ajouter dans tests/subscription.test.ts
 */

const subscriptionTests = `
import { describe, it, expect, beforeEach } from 'vitest'
import { useSubscription } from '~/composables/useSubscription'

describe('useSubscription', () => {
  let subscription: ReturnType<typeof useSubscription>

  beforeEach(() => {
    subscription = useSubscription()
  })

  describe('fetchPlans', () => {
    it('devrait charger les plans', async () => {
      const plans = await subscription.fetchPlans()
      expect(plans).toBeDefined()
      expect(Array.isArray(plans)).toBe(true)
      expect(plans.length).toBeGreaterThan(0)
    })

    it('devrait définir plansLoading pendant le chargement', async () => {
      const promise = subscription.fetchPlans()
      expect(subscription.plansLoading.value).toBe(true)
      await promise
      expect(subscription.plansLoading.value).toBe(false)
    })
  })

  describe('selectPlan', () => {
    it('devrait sélectionner un plan', () => {
      subscription.selectPlan(1)
      expect(subscription.subscriptionForm.planId).toBe(1)
    })
  })

  describe('validateForm', () => {
    it('devrait rejeter un formulaire invalide', () => {
      const isValid = subscription.validateForm()
      expect(isValid).toBe(false)
    })

    it('devrait valider un formulaire complet', () => {
      subscription.subscriptionForm.planId = 1
      subscription.subscriptionForm.email = 'test@example.com'
      subscription.subscriptionForm.firstName = 'John'
      subscription.subscriptionForm.lastName = 'Doe'
      subscription.subscriptionForm.acceptTerms = true

      const isValid = subscription.validateForm()
      expect(isValid).toBe(true)
    })
  })

  describe('formatPrice', () => {
    it('devrait formater les prix FCFA', () => {
      const price = subscription.formatPrice(2000, 'FCFA')
      expect(price).toBe('2 000 FCFA')
    })

    it('devrait retourner "Gratuit" pour prix 0', () => {
      const price = subscription.formatPrice(0, 'FCFA')
      expect(price).toBe('Gratuit')
    })
  })
})
`

// ============================================
// SCÉNARIOS DE TEST MANUEL
// ============================================

export const TEST_SCENARIOS = [
  {
    name: "Charger les plans",
    steps: [
      "1. Accédez à la page /subscriber",
      "2. Vérifiez que les plans se chargent depuis l'API",
      "3. Vérifiez le spinner de chargement",
      "4. Vérifiez que les plans s'affichent correctement"
    ]
  },
  {
    name: "Sélectionner un plan et remplir le formulaire",
    steps: [
      "1. Cliquez sur un plan",
      "2. Vérifiez que la page scroll jusqu'au formulaire",
      "3. Remplissez les champs: email, prénom, nom",
      "4. Cochez les conditions générales"
    ]
  },
  {
    name: "Soumettre l'abonnement",
    steps: [
      "1. Cliquez sur 'S'abonner'",
      "2. Vérifiez le modal de paiement avec progression",
      "3. Après succès, vérifiez la redirection vers /success",
      "4. Vérifiez les détails de l'abonnement"
    ]
  },
  {
    name: "Gestion des erreurs",
    steps: [
      "1. Testez avec un email invalide → message d'erreur",
      "2. Testez sans sélectionner de plan → message d'erreur",
      "3. Testez sans accepter les conditions → message d'erreur",
      "4. Testez une soumission échouée → modal d'erreur avec retry"
    ]
  },
  {
    name: "Annuler l'abonnement",
    steps: [
      "1. Allez à /subscriber/manage",
      "2. Vérifiez l'abonnement actuel",
      "3. Cliquez sur 'Annuler'",
      "4. Confirmez l'annulation",
      "5. Vérifiez que le statut change"
    ]
  }
]

export default {
  mockApiSetup,
  MOCK_PLANS,
  MOCK_SUBSCRIPTION,
  TEST_SCENARIOS
}
