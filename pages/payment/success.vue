<template>
  <div class="payment-status-page">
    <section class="status-panel">
      <div class="status-icon" :class="statusClass">
        <Icon :icon="statusIcon" width="44" height="44" />
      </div>

      <h1>{{ title }}</h1>
      <p class="message">{{ message }}</p>

      <div v-if="reference" class="reference-row">
        <span>Référence</span>
        <strong>{{ reference }}</strong>
      </div>

      <div v-if="apiError || finalizeError" class="alert alert-error">
        {{ apiError || finalizeError }}
      </div>

      <div class="actions">
        <button
          v-if="paymentStatus === 'pending'"
          type="button"
          class="btn btn-primary"
          :disabled="statusLoading"
          @click="checkStatus"
        >
          <span v-if="statusLoading">Vérification...</span>
          <span v-else>Vérifier maintenant</span>
        </button>

        <NuxtLink :to="`/${currentLocale}/subscriber/manage`" class="btn btn-secondary">
          Espace abonné
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import {
  PAXITY_CHECKOUT_DETAILS_KEY,
  PAXITY_CHECKOUT_REFERENCE_KEY,
  PAXITY_COMPLETED_REFERENCE_KEY,
  PAXITY_COMPLETED_EDITION_REFERENCE_KEY,
  PAXITY_PENDING_EDITION_PURCHASE_KEY,
  PAXITY_PENDING_SUBSCRIPTION_KEY,
  usePaxityCheckout
} from '~/composables/usePaxityCheckout'
import { useSubscription } from '~/composables/useSubscription'
import { useAuth } from '~/composables/useAuth'

/** Représentation interne du statut, indépendante du vocabulaire du fournisseur. */
type PaymentStatusView = 'pending' | 'success' | 'error'

/**
 * Au-delà de ce délai, on cesse d'interroger l'API.
 *
 * Paxity ne renvoie jamais le client sur le site : sans borne, la page
 * sonderait indéfiniment un paiement que personne ne validera.
 */
const POLL_TIMEOUT_MS = 10 * 60 * 1000

const route = useRoute()
const config = useRuntimeConfig()
const { getAuthToken } = useAuth()

const {
  getStatus,
  error: paxityError
} = usePaxityCheckout()

const {
  createSubscription,
  subscriptionForm
} = useSubscription()

const reference = ref('')
const paymentStatus = ref<PaymentStatusView>('pending')
const statusLoading = ref(false)
const finalizeLoading = ref(false)
const finalizeError = ref('')
const pendingEditionPurchase = ref<any>(null)
const pollExpired = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let pollDeadline = 0

const currentLocale = computed(() => {
  const pathParts = route.path.split('/')
  const locale = pathParts[1]
  return ['fr', 'en'].includes(locale) ? locale : 'fr'
})

const apiError = computed(() => paxityError.value)

const statusClass = computed(() => ({
  pending: paymentStatus.value === 'pending',
  success: paymentStatus.value === 'success',
  error: paymentStatus.value === 'error'
}))

const statusIcon = computed(() => {
  if (paymentStatus.value === 'success') return 'mdi:check-circle-outline'
  if (paymentStatus.value === 'error') return 'mdi:alert-circle-outline'
  return 'mdi:clock-outline'
})

const title = computed(() => {
  if (paymentStatus.value === 'success') return 'Paiement confirmé'
  if (paymentStatus.value === 'error') return 'Paiement échoué'
  return 'Paiement en attente'
})

const message = computed(() => {
  if (finalizeLoading.value) {
    return pendingEditionPurchase.value
      ? 'Paiement confirmé. Enregistrement de votre édition en cours...'
      : 'Paiement confirmé. Activation de votre abonnement en cours...'
  }
  if (paymentStatus.value === 'success') return 'Votre paiement a été validé.'
  if (paymentStatus.value === 'error') {
    return pendingEditionPurchase.value
      ? 'Le paiement n’a pas pu être validé. Vous pouvez réessayer depuis votre espace abonné.'
      : 'Le paiement n’a pas pu être validé. Vous pouvez réessayer depuis la page d’abonnement.'
  }
  if (pollExpired.value) {
    return `Nous n’avons pas reçu de confirmation. Si vous avez été débité, contactez-nous en indiquant la référence ${reference.value}.`
  }
  return 'Validez le paiement sur votre téléphone ou dans l’onglet ouvert. Cette page se met à jour automatiquement.'
})

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const restorePendingSubscription = () => {
  const pending = localStorage.getItem(PAXITY_PENDING_SUBSCRIPTION_KEY)
  if (!pending) return null

  try {
    return JSON.parse(pending)
  } catch (error) {
    console.error('Erreur restauration abonnement:', error)
    return null
  }
}

const restorePendingEditionPurchase = () => {
  const pending = localStorage.getItem(PAXITY_PENDING_EDITION_PURCHASE_KEY)
  if (!pending) return null

  try {
    return JSON.parse(pending)
  } catch (error) {
    console.error('Erreur restauration achat d’édition:', error)
    return null
  }
}

const finalizeEditionPurchase = async () => {
  if (!reference.value || finalizeLoading.value || !pendingEditionPurchase.value) return

  const completedReference = localStorage.getItem(PAXITY_COMPLETED_EDITION_REFERENCE_KEY)
  if (completedReference === reference.value) return

  finalizeLoading.value = true
  finalizeError.value = ''

  try {
    const pending = pendingEditionPurchase.value
    const edition = pending.edition
    if (!edition?.id) {
      throw new Error('Paiement confirmé, mais les informations de l’édition sont introuvables.')
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error('Paiement confirmé, mais votre session a expiré. Reconnectez-vous pour enregistrer l’achat.')
    }

    const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/purchase-edition`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        edition_id: edition.id,
        payment_reference: reference.value,
        payment_method: 'paxity'
      })
    })

    if (!response.ok) {
      let message = 'Paiement confirmé, mais l’achat n’a pas pu être enregistré.'
      try {
        const data = await response.json()
        message = data?.message || data?.error || message
      } catch {
        // La réponse du backend ne contient pas de JSON exploitable.
      }
      throw new Error(message)
    }

    const purchasedEditions = JSON.parse(localStorage.getItem('purchasedEditions') || '[]')
    if (!purchasedEditions.some((item: any) => String(item.id) === String(edition.id))) {
      purchasedEditions.push({
        ...edition,
        purchaseDate: new Date().toISOString(),
        transactionId: pending.transactionId,
        paymentReference: reference.value
      })
      localStorage.setItem('purchasedEditions', JSON.stringify(purchasedEditions))
    }

    const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
    const paymentExists = paymentHistory.some(
      (item: any) => item.paymentReference === reference.value || item.transactionId === pending.transactionId
    )
    if (!paymentExists) {
      paymentHistory.push({
        id: paymentHistory.length + 1,
        date: new Date().toISOString(),
        description: `Achat edition: ${edition.title}`,
        amount: pending.amount,
        type: 'single',
        status: 'completed',
        provider: 'paxity',
        paymentMethod: pending.paymentMethod,
        transactionId: pending.transactionId,
        paymentReference: reference.value,
        invoiceUrl: null
      })
      localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory))
    }

    localStorage.setItem(PAXITY_COMPLETED_EDITION_REFERENCE_KEY, reference.value)
    localStorage.removeItem(PAXITY_PENDING_EDITION_PURCHASE_KEY)
    localStorage.removeItem(PAXITY_CHECKOUT_REFERENCE_KEY)
    localStorage.removeItem(PAXITY_CHECKOUT_DETAILS_KEY)
    pendingEditionPurchase.value = null
  } catch (error: any) {
    finalizeError.value = error?.message || 'Erreur lors de l’enregistrement de votre achat'
  } finally {
    finalizeLoading.value = false
  }
}

const finalizeSubscription = async () => {
  if (!reference.value || finalizeLoading.value) return

  const completedReference = localStorage.getItem(PAXITY_COMPLETED_REFERENCE_KEY)
  if (completedReference === reference.value) return

  const pendingSubscription = restorePendingSubscription()
  if (!pendingSubscription) return

  finalizeLoading.value = true
  finalizeError.value = ''

  try {
    Object.assign(subscriptionForm.value, pendingSubscription)
    const success = await createSubscription(pendingSubscription)

    if (!success) {
      throw new Error('Paiement confirmé, mais l’abonnement n’a pas pu être activé automatiquement.')
    }

    localStorage.setItem(PAXITY_COMPLETED_REFERENCE_KEY, reference.value)
    localStorage.removeItem(PAXITY_PENDING_SUBSCRIPTION_KEY)
    localStorage.removeItem(PAXITY_CHECKOUT_REFERENCE_KEY)
    localStorage.removeItem(PAXITY_CHECKOUT_DETAILS_KEY)
    localStorage.removeItem('selectedPlan')
  } catch (error: any) {
    finalizeError.value = error?.message || 'Erreur lors de l’activation de votre abonnement'
  } finally {
    finalizeLoading.value = false
  }
}

const checkStatus = async () => {
  if (!reference.value) {
    finalizeError.value = 'Référence de paiement introuvable'
    return
  }

  if (pollDeadline && Date.now() > pollDeadline) {
    stopPolling()
    pollExpired.value = true
    return
  }

  statusLoading.value = true

  try {
    const status = await getStatus(reference.value)

    // Paxity répond PENDING / SUCCESS / FAILED ; la page raisonne en
    // pending / success / error.
    paymentStatus.value =
      status.status === 'SUCCESS' ? 'success' :
      status.status === 'FAILED' ? 'error' : 'pending'

    if (paymentStatus.value === 'success') {
      stopPolling()
      if (pendingEditionPurchase.value) {
        await finalizeEditionPurchase()
      } else {
        await finalizeSubscription()
      }
    }

    if (paymentStatus.value === 'error') {
      stopPolling()
    }
  } catch (error) {
    // Une lecture qui échoue ne conclut rien : le sondage suivant retentera.
    console.error('Erreur vérification statut Paxity:', error)
  } finally {
    statusLoading.value = false
  }
}

onMounted(async () => {
  pendingEditionPurchase.value = restorePendingEditionPurchase()
  reference.value = String(route.query.reference || localStorage.getItem(PAXITY_CHECKOUT_REFERENCE_KEY) || '')

  pollDeadline = Date.now() + POLL_TIMEOUT_MS
  await checkStatus()

  if (paymentStatus.value === 'pending') {
    pollTimer = setInterval(checkStatus, 4000)
  }
})

onBeforeUnmount(stopPolling)

useHead({
  title: 'Statut du paiement - ALT News',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.payment-status-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem;
}

.status-panel {
  width: min(100%, 560px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.status-icon {
  width: 76px;
  height: 76px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 1.25rem;
}

.status-icon.pending {
  color: #b7791f;
  background: #fff7ed;
}

.status-icon.success {
  color: #047857;
  background: #ecfdf5;
}

.status-icon.error {
  color: #b91c1c;
  background: #fef2f2;
}

h1 {
  font-size: 1.8rem;
  color: #111827;
  margin-bottom: 0.75rem;
}

.message {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.reference-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  color: #374151;
  margin-bottom: 1rem;
  overflow-wrap: anywhere;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1.2rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.btn-primary {
  background: #d4b128;
  color: #ffffff;
}

.btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
