/**
 * Paiement via Paxity.
 *
 * Aucune clé n'est manipulée ici. Tout passe par les
 * routes `/api/payment/paxity/**` du serveur Nitro, qui détiennent seules les
 * identifiants. Il n'y a donc ni CORS à contourner ni secret dans le bundle.
 */

export const PAXITY_CHECKOUT_REFERENCE_KEY = 'paxity_checkout_reference'
export const PAXITY_CHECKOUT_DETAILS_KEY = 'paxity_checkout_details'
export const PAXITY_PENDING_SUBSCRIPTION_KEY = 'paxity_pending_subscription'
export const PAXITY_COMPLETED_REFERENCE_KEY = 'paxity_completed_reference'
export const PAXITY_PENDING_EDITION_PURCHASE_KEY = 'paxity_pending_edition_purchase'
export const PAXITY_COMPLETED_EDITION_REFERENCE_KEY = 'paxity_completed_edition_reference'

/** Identifiant réservé à la carte bancaire, qui ne figure pas au catalogue Paxity. */
export const PAXITY_CARD_METHOD_ID = '__CARD__'

export type PaxityMethodType = 'PUSH' | 'QR_CODE' | 'OTP' | 'CARD'
export type PaxityPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface PaxityPaymentMethod {
  id: string
  name: string
  logo: string | null
  type: PaxityMethodType
  currency: string
  country: string
  phonePrefix: string | null
  instructions: string | null
  /**
   * `false` = moyen affiché mais non sélectionnable.
   *
   * Sert à la carte bancaire, qu'on montre pour annoncer son arrivée sans
   * laisser un client y saisir ses coordonnées : Paxity refuse encore
   * l'endpoint (403) tant que le business n'est pas habilité.
   */
  available?: boolean
}

/**
 * Ajoute la carte bancaire à la liste des moyens.
 *
 * Elle ne figure pas au catalogue Paxity : c'est un endpoint distinct
 * (`pay-in-card`), donc l'entrée est construite ici.
 */
export function appendCardOption(
  methods: PaxityPaymentMethod[],
  enabled: boolean
): PaxityPaymentMethod[] {
  return [
    ...methods.map((method) => ({ ...method, available: true })),
    {
      id: PAXITY_CARD_METHOD_ID,
      name: 'Carte bancaire',
      logo: null,
      type: 'CARD' as const,
      currency: 'XOF',
      country: 'CI',
      phonePrefix: null,
      instructions: enabled
        ? 'Visa ou Mastercard — vous serez peut-être invité à valider auprès de votre banque.'
        : 'Bientôt disponible : nous attendons son activation par notre prestataire de paiement.',
      available: enabled,
    },
  ]
}

export interface PaxityCheckoutPayload {
  method: string
  amount: number
  phone: string
  reference?: string
  description?: string
  otp?: string
}

/** Données de carte, transmises au serveur puis immédiatement oubliées. */
export interface PaxityCardPayload {
  amount: number
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderFirstName: string
  holderLastName: string
  reference?: string
  description?: string
}

export interface PaxityCheckoutResponse {
  reference: string
  status: PaxityPaymentStatus
  amount: number
  netAmount: number | null
  currency: string
  methodType: PaxityMethodType
  /** Page de paiement de l'opérateur — `null` pour les méthodes `PUSH`. */
  redirectUrl: string | null
  /** PNG en base64, sans préfixe `data:`. */
  qrCode: string | null
  createdAt: string | null
}

export interface PaxityStatusResponse {
  reference: string
  merchantReference: string | null
  status: PaxityPaymentStatus
  amount: number
  currency: string
  method: string | null
}

export const usePaxityCheckout = () => {
  const loading = ref(false)
  const error = ref('')

  const call = async <T>(url: string, options: Parameters<typeof $fetch>[1] = {}) => {
    error.value = ''
    try {
      return await $fetch<T>(url, options)
    } catch (err: any) {
      // Nitro place le message métier dans statusMessage.
      error.value =
        err?.data?.statusMessage ||
        err?.statusMessage ||
        err?.message ||
        'Erreur lors de la communication avec le service de paiement'
      throw err
    }
  }

  /** Moyens de paiement actifs, éventuellement filtrés par pays. */
  const getMethods = async (country?: string) => {
    loading.value = true
    try {
      return await call<PaxityPaymentMethod[]>('/api/payment/paxity/methods', {
        query: country ? { country } : {}
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Initie un encaissement.
   *
   * Ne jamais rejouer cet appel après un échec réseau : la transaction a pu
   * être créée côté Paxity. Vérifier par `getStatus()` avant toute relance.
   */
  const createCheckout = async (payload: PaxityCheckoutPayload) => {
    loading.value = true
    try {
      return await call<PaxityCheckoutResponse>('/api/payment/paxity/checkout', {
        method: 'POST',
        body: payload
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Initie un encaissement par carte bancaire.
   *
   * ⚠️ Le numéro de carte et le cryptogramme partent vers notre serveur, qui
   * les relaie à Paxity sans jamais les journaliser ni les conserver. Ne pas
   * les stocker côté navigateur — ni `localStorage`, ni état persistant — et
   * vider les champs dès la réponse reçue.
   *
   * La route répond `501` tant que Paxity n'a pas habilité le business.
   */
  const createCardCheckout = async (payload: PaxityCardPayload) => {
    loading.value = true
    try {
      return await call<PaxityCheckoutResponse>('/api/payment/paxity/card', {
        method: 'POST',
        body: payload
      })
    } finally {
      loading.value = false
    }
  }

  /** État réel de la transaction, lu auprès de Paxity. */
  const getStatus = async (reference: string) => {
    return call<PaxityStatusResponse>('/api/payment/paxity/status', {
      query: { reference }
    })
  }

  /**
   * Interroge le statut jusqu'à ce qu'il soit définitif.
   *
   * Indispensable pour les méthodes `PUSH`, qui ne renvoient aucune URL : le
   * payeur valide sur son téléphone et rien ne le ramène sur le site.
   */
  const waitForCompletion = async (
    reference: string,
    { intervalMs = 4000, timeoutMs = 300_000, onTick }: {
      intervalMs?: number
      timeoutMs?: number
      onTick?: (status: PaxityStatusResponse) => void
    } = {}
  ): Promise<PaxityStatusResponse> => {
    const deadline = Date.now() + timeoutMs
    let last: PaxityStatusResponse | undefined

    while (Date.now() < deadline) {
      try {
        last = await getStatus(reference)
        onTick?.(last)
        if (last.status !== 'PENDING') return last
      } catch {
        // Une lecture qui échoue ne conclut rien : on retente jusqu'au délai.
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    return last ?? { reference, merchantReference: null, status: 'PENDING', amount: 0, currency: '', method: null }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getMethods,
    createCheckout,
    createCardCheckout,
    getStatus,
    waitForCompletion
  }
}
