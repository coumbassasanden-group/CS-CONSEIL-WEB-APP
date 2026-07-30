export const JEKO_CHECKOUT_REFERENCE_KEY = 'jeko_checkout_reference'
export const JEKO_CHECKOUT_DETAILS_KEY = 'jeko_checkout_details'
export const JEKO_PENDING_SUBSCRIPTION_KEY = 'jeko_pending_subscription'
export const JEKO_COMPLETED_REFERENCE_KEY = 'jeko_completed_reference'
export const JEKO_PENDING_EDITION_PURCHASE_KEY = 'jeko_pending_edition_purchase'
export const JEKO_COMPLETED_EDITION_REFERENCE_KEY = 'jeko_completed_edition_reference'

export type JekoPaymentStatus = 'pending' | 'success' | 'error'

export interface JekoPaymentMethod {
  id?: string
  code?: string
  name?: string
  logo?: string
  [key: string]: any
}

export interface JekoCheckoutPayload {
  userId: string | number
  business: string
  amount: number
  currency: string
  paymentMethod?: string
  return_url?: string
  metadata?: Record<string, any>
}

export interface JekoCheckoutResponse {
  reference: string
  paymentRequestId?: string
  redirectUrl: string
  [key: string]: any
}

export interface JekoStatusResponse {
  reference?: string
  status: JekoPaymentStatus
  [key: string]: any
}

export const useJekoCheckout = () => {
  const config = useRuntimeConfig()
  const checkoutApiBase = computed(() => {
    return String(config.public.checkoutApiBase || '').replace(/\/$/, '')
  })

  const loading = ref(false)
  const error = ref('')

  const parseApiError = async (response: Response) => {
    try {
      const data = await response.json()
      return data?.message || data?.error || `Erreur API (${response.status})`
    } catch {
      return `Erreur API (${response.status})`
    }
  }

  const request = async <T>(endpoint: string, options: RequestInit = {}) => {
    error.value = ''

    try {
      const response = await fetch(`${checkoutApiBase.value}${endpoint}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(options.headers || {})
        }
      })

      if (!response.ok) {
        throw new Error(await parseApiError(response))
      }

      return await response.json() as T
    } catch (err: any) {
      error.value = err?.message || 'Erreur lors de la communication avec le service de paiement'
      throw err
    }
  }

  const getMethods = async () => {
    loading.value = true
    try {
      const data = await request<JekoPaymentMethod[] | { data?: JekoPaymentMethod[]; methods?: JekoPaymentMethod[] }>(
        '/api/payment-providers/jeko/methods'
      )

      if (Array.isArray(data)) return data
      return data.data || data.methods || []
    } finally {
      loading.value = false
    }
  }

  const createCheckout = async (payload: JekoCheckoutPayload) => {
    // console.log("vvvvvvv------", payload)
    loading.value = true
    try {
      const data = await request<JekoCheckoutResponse | { data?: JekoCheckoutResponse; checkout?: JekoCheckoutResponse }>(
        '/api/payment-providers/jeko/checkout',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      const checkout = 'redirectUrl' in data ? data : data.data || data.checkout
      if (!checkout?.reference || !checkout?.redirectUrl) {
        throw new Error('Réponse checkout Jeko invalide')
      }

      return checkout
    } finally {
      loading.value = false
    }
  }

  const getStatus = async (reference: string, userId?: string | number) => {
    if (!reference) {
      throw new Error('Référence de paiement manquante')
    }

    const query = userId ? `?userId=${encodeURIComponent(String(userId))}` : ''
    const data = await request<JekoStatusResponse | { data?: JekoStatusResponse; payment?: JekoStatusResponse }>(
      `/api/payment-providers/jeko/status/${encodeURIComponent(reference)}${query}`
    )

    const status = 'status' in data ? data : data.data || data.payment
    if (!status?.status) {
      throw new Error('Statut de paiement Jeko invalide')
    }

    return status
  }

  const logoUrl = (logo?: string) => {
    if (!logo) return ''
    if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo
    return `${checkoutApiBase.value}${logo}`
  }

  return {
    loading,
    error,
    getMethods,
    createCheckout,
    getStatus,
    logoUrl
  }
}
