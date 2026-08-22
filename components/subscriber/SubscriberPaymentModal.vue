<template>
  <div v-if="show" class="payment-modal-overlay" @click.self="$emit('close')">
    <div class="payment-modal">
      <button class="modal-close" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>

      <div class="modal-header">
        <Icon icon="mdi:cart-check" class="modal-icon" />
        <h2>Acheter cette edition</h2>
      </div>

      <div class="modal-body">
        <div v-if="edition" class="edition-preview">
          <img :src="imageUrl" :alt="edition.title" />
          <div class="edition-info">
            <h3>{{ edition.title }}</h3>
            <p class="edition-price">{{ formatPrice(unitPrice) }}</p>
          </div>
        </div>

        <!-- Champ telephone : inutile pour la carte, que Paxity collecte. -->
        <div v-if="!isCardSelected" class="phone-input-wrapper">
          <label for="phone" class="phone-label">
            <Icon icon="mdi:phone" /> Numero de telephone
          </label>
          <input
            type="tel"
            id="phone"
            v-model="phoneNumber"
            placeholder="Ex: 0701020304"
            class="phone-input"
            :class="{ 'has-error': phoneError }"
          />
          <p v-if="phoneError" class="phone-error">{{ phoneError }}</p>
        </div>

        <div class="payment-summary">
          <div class="summary-row">
            <span>Prix de l'edition</span>
            <span>{{ formatPrice(unitPrice) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total a payer</span>
            <span>{{ formatPrice(unitPrice) }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <div class="payment-methods-header">
            <span>Moyen de paiement</span>
            <small>Paiement sécurisé</small>
          </div>

          <div v-if="methodsLoading" class="payment-state">
            <Icon icon="mdi:loading" class="spin" />
            Chargement des moyens de paiement...
          </div>

          <div v-else-if="methodsError" class="payment-state payment-state-error">
            <span>{{ methodsError }}</span>
            <button type="button" class="btn-retry" @click="loadPaymentMethods">
              Réessayer
            </button>
          </div>

          <div v-else-if="paymentMethods.length" class="country-picker">
            <label class="country-picker-label">Pays du moyen de paiement</label>
            <select v-model="paysChoisi" class="country-picker-select">
              <option v-for="p in pays" :key="p.code" :value="p.code">{{ p.nom }}</option>
            </select>
          </div>

          <div v-if="!methodsLoading && !methodsError && paymentMethods.length" class="payment-methods-grid">
            <label
              v-for="method in paymentMethods"
              :key="getPaymentMethodValue(method)"
              class="payment-method-card"
              :class="{ selected: selectedPaymentMethod === getPaymentMethodValue(method) }"
            >
              <input
                v-model="selectedPaymentMethod"
                type="radio"
                name="edition-payment-method"
                :value="getPaymentMethodValue(method)"
                :disabled="isPaying || !getPaymentMethodValue(method)"
              />
              <span class="method-logo">
                <img
                  v-if="method.logo && !brokenLogos.has(method.id)"
                  :src="method.logo"
                  alt=""
                  @error="brokenLogos.add(method.id)"
                />
                <Icon v-else icon="mdi:wallet-outline" />
              </span>
              <span>{{ method.name }}</span>
            </label>
          </div>

          <div v-else class="payment-state payment-state-error">
            Aucun moyen de paiement n'est disponible.
          </div>
        </div>

        <p v-if="conversionEnCours" class="conversion-note">Calcul du montant…</p>
        <p v-else-if="montantConverti" class="conversion-note">
          Ce moyen encaisse en {{ montantConverti.to }} : vous serez débité de
          <strong>{{ montantConverti.convertedAmount }} {{ montantConverti.to }}</strong>
          (équivalent de {{ formatPrice(montantConverti.amount) }}).
        </p>

        <p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>

        <button
          type="button"
          class="btn-pay"
          :disabled="!canPay"
          @click="handlePay"
        >
          <Icon :icon="isPaying ? 'mdi:loading' : 'mdi:lock'" :class="{ spin: isPaying }" />
          {{
            widgetLoading
              ? 'Ouverture du paiement sécurisé…'
              : isPaying
                ? 'Paiement en cours...'
                : isCardSelected
                  ? `Payer par carte ${formatPrice(unitPrice)}`
                  : `Payer ${formatPrice(unitPrice)}`
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  PAXITY_CARD_METHOD_ID,
  PAXITY_CHECKOUT_DETAILS_KEY,
  PAXITY_CHECKOUT_REFERENCE_KEY,
  PAXITY_PENDING_EDITION_PURCHASE_KEY,
  appendCardOption,
  type PaxityPaymentMethod,
  usePaxityCheckout
} from '~/composables/usePaxityCheckout'
import { usePaxityWidget } from '~/composables/usePaxityWidget'
import { usePaymentCountries, useMontantConverti } from '~/composables/usePaymentCountries'
import { useAuth } from '~/composables/useAuth'

interface Edition {
  id: number | string
  title: string
  image?: string
}

const props = defineProps<{
  show: boolean
  edition: Edition | null
  unitPrice: number
  apiBaseUrl: string
  formatPrice: (price: number) => string
  initialPhone?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const config = useRuntimeConfig()
const { getAuthUser } = useAuth()
const { ouvrir: ouvrirWidgetCarte, loading: widgetLoading } = usePaxityWidget()
const { pays, paysChoisi, moyensDuPays, charger: chargerCatalogue } = usePaymentCountries()

/** La carte n'est proposée que si le widget Paxity est actif. */
const cardEnabled = computed(() => String(config.public.paxityCardWidget) === 'true')
const isCardSelected = computed(() => selectedPaymentMethod.value === PAXITY_CARD_METHOD_ID)
const {
  createCheckout,
  error: paxityError,
  getMethods
} = usePaxityCheckout()

// Phone state
const phoneNumber = ref(props.initialPhone || '')
const phoneError = ref('')
const checkoutError = ref('')
const methodsLoading = ref(false)
const methodsError = ref('')
const paymentMethods = ref<PaxityPaymentMethod[]>([])
const selectedPaymentMethod = ref('')
const isPaying = ref(false)
const brokenLogos = ref(new Set<string>())

const currentLocale = computed(() => {
  const locale = route.path.split('/')[1]
  return ['fr', 'en'].includes(locale) ? locale : 'fr'
})

const getPaymentMethodValue = (method: PaxityPaymentMethod) => String(method.id || '')

const selectedMethodDetails = computed(
  () => paymentMethods.value.find(method => method.id === selectedPaymentMethod.value) || null
)

const { converti: montantConverti, chargement: conversionEnCours } = useMontantConverti(
  () => props.unitPrice,
  () => selectedMethodDetails.value?.currency
)

watch(paysChoisi, () => {
  if (!paymentMethods.value.length) return
  paymentMethods.value = appendCardOption(moyensDuPays.value, cardEnabled.value)
  if (!paymentMethods.value.some(method => method.id === selectedPaymentMethod.value)) {
    selectedPaymentMethod.value = paymentMethods.value.find(method => method.available !== false)?.id || ''
  }
})

const loadPaymentMethods = async () => {
  if (methodsLoading.value) return

  methodsLoading.value = true
  methodsError.value = ''

  try {
    await chargerCatalogue()
    paymentMethods.value = appendCardOption(moyensDuPays.value, cardEnabled.value)
    const selectionExists = paymentMethods.value.some(
      method => getPaymentMethodValue(method) === selectedPaymentMethod.value
    )
    if (!selectionExists) {
      selectedPaymentMethod.value = paymentMethods.value[0]?.id || ''
    }
  } catch (error: any) {
    paymentMethods.value = []
    selectedPaymentMethod.value = ''
    methodsError.value = error?.message || 'Impossible de charger les moyens de paiement'
  } finally {
    methodsLoading.value = false
  }
}

// Reset phone when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    phoneNumber.value = props.initialPhone || ''
    phoneError.value = ''
    checkoutError.value = ''
    isPaying.value = false
    loadPaymentMethods()
  }
})

// Validate phone
const isPhoneValid = computed(() => {
  const phone = phoneNumber.value.trim()
  return phone.length >= 8
})

const canPay = computed(() => {
  // Le widget collecte lui-même les coordonnées : pas de téléphone à saisir.
  return (isCardSelected.value || isPhoneValid.value) &&
    !widgetLoading.value &&
    !!props.edition &&
    !!selectedPaymentMethod.value &&
    !methodsLoading.value &&
    !isPaying.value
})

// Handle pay click
const handlePay = async () => {
  checkoutError.value = ''

  // Carte : le widget Paxity affiche son propre formulaire et collecte le
  // numéro chez lui. Aucun téléphone requis, et rien à valider ici.
  if (isCardSelected.value) {
    if (!props.edition) {
      checkoutError.value = 'Édition introuvable'
      return
    }

    try {
      await ouvrirWidgetCarte({
        amount: props.unitPrice,
        currency: 'XOF',
        country: 'CI',
        idClient: `ED-${props.edition.id}-S${(getAuthUser() || {}).id || 0}-${Date.now()}`,
        ipn: `${window.location.origin}/api/payment/paxity/webhook`
      })
    } catch (error: any) {
      checkoutError.value = error?.message
        || 'Impossible d\'ouvrir le paiement par carte.'
    }
    return
  }

  const phone = phoneNumber.value.trim()

  if (!phone) {
    phoneError.value = 'Veuillez entrer votre numero de telephone'
    return
  }

  if (phone.length < 8) {
    phoneError.value = 'Le numero doit contenir au moins 8 chiffres'
    return
  }

  phoneError.value = ''
  checkoutError.value = ''

  if (!props.edition) {
    checkoutError.value = 'Édition introuvable'
    return
  }

  if (!selectedPaymentMethod.value) {
    checkoutError.value = 'Veuillez sélectionner un moyen de paiement'
    return
  }

  const user = getAuthUser()
  const userId = user?.id || user?.userId || user?.subscriber_id || user?.email
  if (!userId) {
    checkoutError.value = 'Utilisateur connecté introuvable'
    return
  }

  // Les méthodes QR_CODE renvoient une page opérateur, les méthodes PUSH non :
  // le client valide alors directement sur son téléphone. L'onglet n'est donc
  // ouvert que si une redirection est réellement attendue.
  const expectsRedirect = selectedMethodDetails.value?.type === 'QR_CODE'
  const paymentWindow = expectsRedirect ? window.open('about:blank', '_blank') : null

  isPaying.value = true

  try {
    // Porte l'édition et l'abonné : le webhook Paxity enregistre l'achat même
    // si le navigateur ne revient pas (carte, onglet fermé).
    const transactionId = `ED-${props.edition.id}-S${userId}-${Date.now()}`
    const checkout = await createCheckout({
      method: selectedPaymentMethod.value,
      amount: props.unitPrice,
      phone,
      reference: transactionId,
      description: `ALT News - ${props.edition.title}`
    })

    const pendingPurchase = {
      edition: props.edition,
      transactionId,
      reference: checkout.reference,
      userId,
      // Mémorisé ici pour que la page de suivi puisse enregistrer l'achat
      // même si la session a expiré entre-temps : le backend identifie
      // l'acheteur par e-mail, nom et prénom, pas par le jeton.
      email: getAuthUser()?.email,
      firstName: getAuthUser()?.firstName,
      lastName: getAuthUser()?.lastName,
      amount: props.unitPrice,
      phone,
      paymentMethod: selectedPaymentMethod.value,
      provider: 'paxity',
      timestamp: Date.now()
    }

    localStorage.setItem(PAXITY_CHECKOUT_REFERENCE_KEY, checkout.reference)
    localStorage.setItem(PAXITY_CHECKOUT_DETAILS_KEY, JSON.stringify(checkout))
    localStorage.setItem(PAXITY_PENDING_EDITION_PURCHASE_KEY, JSON.stringify(pendingPurchase))

    if (checkout.redirectUrl && paymentWindow) {
      paymentWindow.location.href = checkout.redirectUrl
    } else if (checkout.redirectUrl) {
      // Le navigateur a bloqué l'ouverture : on redirige l'onglet courant.
      await navigateTo(checkout.redirectUrl, { external: true })
      return
    }

    // Paxity ne rappelle jamais le site après paiement : c'est la page de
    // suivi qui interroge le statut jusqu'à résolution.
    await navigateTo(
      `/${currentLocale.value}/payment/success?reference=${encodeURIComponent(checkout.reference)}`
    )
  } catch (error: any) {
    paymentWindow?.close()
    checkoutError.value = paxityError.value || error?.message || 'Impossible de démarrer le paiement'
    isPaying.value = false
  }
}

const imageUrl = computed(() => {
  if (!props.edition?.image) return '/placeholder.jpg'
  const img = props.edition.image
  return img.startsWith('http') ? img : `${props.apiBaseUrl}/storage/${img}`
})
</script>

<style scoped>
/*
  Le voile défile lui-même et aligne en haut.

  Il était centré sans hauteur maximale : dès que le contenu dépassait l'écran
  — ce qu'a provoqué l'ajout de la carte aux moyens de paiement — il débordait
  en haut comme en bas, le bouton « Payer » sortait du champ et rien ne
  défilait, la page étant en `position: fixed`.
*/
.payment-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  z-index: 1000;
  padding: 1rem;
}

.payment-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  position: relative;
  /* Marge automatique : reste centré quand il tient, s'aligne en haut sinon. */
  margin: auto;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  color: #6b7280;
  z-index: 10;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
}

.modal-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 0 2rem 2rem;
}

.edition-preview {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.edition-preview img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.edition-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.edition-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.edition-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #10b981;
  margin: 0;
}

.payment-summary {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.payment-methods {
  margin-bottom: 1.5rem;
}


.country-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
}
.country-picker-label {
  font-size: 0.85rem;
  color: #6b7280;
}
.country-picker-select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  font: inherit;
  background: #fff;
}
.conversion-note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  border-radius: 8px;
  padding: 0.7rem 0.85rem;
  line-height: 1.5;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.payment-methods-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #374151;
}

.payment-methods-header small {
  color: #6b7280;
  font-weight: 500;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.payment-method-card.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.payment-method-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.method-logo {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
}

.method-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.payment-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 52px;
  padding: 0.75rem;
  border-radius: 12px;
  background: #f9fafb;
  color: #6b7280;
  text-align: center;
}

.payment-state-error,
.checkout-error {
  color: #b91c1c;
}

.payment-state-error {
  flex-direction: column;
  background: #fef2f2;
}

.btn-retry {
  padding: 0.4rem 0.75rem;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: white;
  color: #b91c1c;
  cursor: pointer;
}

.checkout-error {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.summary-row.total {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-pay {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Phone input styles */
.phone-input-wrapper {
  margin-bottom: 1.5rem;
}

.phone-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.phone-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.phone-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.phone-input.has-error {
  border-color: #ef4444;
}

.phone-input::placeholder {
  color: #9ca3af;
}

.phone-error {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #ef4444;
}

@media (max-width: 480px) {
  .edition-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .edition-preview img {
    width: 100px;
    height: 130px;
  }

  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
}
</style>
