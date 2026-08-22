/**
 * Widget de paiement par carte hébergé par Paxity.
 *
 * Le numéro de carte et le cryptogramme sont saisis dans l'interface de Paxity
 * et postés par elle : ils ne traversent jamais nos serveurs, ce qui nous
 * garde hors du périmètre PCI-DSS. C'est toute la différence avec la route
 * `/api/payment/paxity/card`, qui reçoit le PAN et reste fermée.
 *
 * Attention au fichier servi : la documentation de Paxity renvoie vers
 * `paxity-widget.iife.js`, qui appelle leur environnement de développement et
 * n'expose aucun `window.PaxityWidget`. Le bon binaire est `card-widget.iife.js`,
 * autonome (il embarque React) et branché sur `transaction.paxity.io`.
 */

const WIDGET_CSS = 'https://saas.paxity.io/widget/style.css'
const WIDGET_JS = 'https://saas.paxity.io/widget/card-widget.iife.js'

export interface PaxityWidgetOptions {
  amount: number
  currency: string
  country: string
  idClient: string
  ipn: string
}

let chargement: Promise<void> | undefined

const chargerRessources = () => {
  if (chargement) return chargement

  chargement = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = WIDGET_CSS
      document.head.appendChild(style)
    }

    if ((window as any).PaxityWidget) return resolve()

    const script = document.createElement('script')
    script.src = WIDGET_JS
    // Pas de `crossOrigin` : saas.paxity.io ne renvoie aucun en-tête CORS et le
    // navigateur refuserait alors le script.
    script.onload = () => resolve()
    script.onerror = () => {
      chargement = undefined
      reject(new Error('Le service de paiement par carte est momentanément indisponible.'))
    }
    document.head.appendChild(script)
  })

  return chargement
}

export const usePaxityWidget = () => {
  const loading = ref(false)
  const error = ref('')

  const ouvrir = async (options: PaxityWidgetOptions) => {
    error.value = ''
    loading.value = true

    try {
      const credentials = await $fetch<{
        apiKey: string
        apiToken: string
        developerAccountId: string
      }>('/api/payment/paxity/widget-config')

      await chargerRessources()

      const widget = (window as any).PaxityWidget
      if (!widget?.open) {
        throw new Error('Le service de paiement par carte est momentanément indisponible.')
      }

      // Deux défauts connus du bundle, à compenser avant l'ouverture :
      // `developerAccountId` n'est que relu dans `localStorage`, jamais écrit —
      // sans lui les appels partent vers /developer-accounts/null/ et
      // répondent 401 ; et les clés, écrites dans `localStorage`, sont relues
      // par un des clients axios dans `sessionStorage`.
      localStorage.setItem('developerAccountId', credentials.developerAccountId)
      sessionStorage.setItem('apiKey', credentials.apiKey)
      sessionStorage.setItem('apiToken', credentials.apiToken)

      // `isOpen` est lu une seule fois, dans un `useEffect` sans dépendances :
      // il doit valoir `true` dès l'appel, sans quoi le modal reste fermé.
      widget.open({
        amount: options.amount,
        currency: options.currency,
        country: options.country,
        idClient: options.idClient,
        ipn: options.ipn,
        credentials: { apiKey: credentials.apiKey, apiToken: credentials.apiToken },
        isOpen: true
      })
    } catch (err: any) {
      error.value = err?.data?.statusMessage
        || err?.message
        || 'Impossible d\'ouvrir le paiement par carte.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { ouvrir, loading: readonly(loading), error: readonly(error) }
}
