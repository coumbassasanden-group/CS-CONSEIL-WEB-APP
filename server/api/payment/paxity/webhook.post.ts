import { CsPayError } from 'cspay/paxity'

import { getPaxity } from '../../../utils/paxity'

/**
 * Réception des notifications Paxity (IPN).
 *
 * `POST /api/payment/paxity/webhook?secret=...`
 *
 * Paxity ne signe pas ses notifications : le secret partagé dans l'URL est la
 * seule preuve d'origine disponible, et `cspay` le compare en temps constant.
 *
 * Répond 200 dès que la notification est authentifiée, même si le traitement
 * échoue : un fournisseur qui reçoit une erreur rejoue sa notification, parfois
 * pendant des heures. Seul un secret invalide produit un 401.
 *
 * ⚠️ Ce gestionnaire journalise mais ne valide aucun abonnement. Le site étant
 * en `ssr: false` sans base côté Nitro, la finalisation reste pilotée par le
 * navigateur sur `pages/payment/success.vue`, qui appelle `/status` — la source
 * de vérité. Déplacer la finalisation ici le jour où une persistance serveur
 * sera disponible.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => undefined)

  try {
    const notification = await getPaxity().parseWebhook({
      body,
      headers: getHeaders(event) as Record<string, string | undefined>,
      query: getQuery(event) as Record<string, string | undefined>
    })

    if (notification) {
      console.log(
        `[paxity:webhook] ${notification.reference} → ${notification.status}` +
          ` (${notification.amount} ${notification.currency}` +
          `${notification.merchantReference ? `, réf. marchand ${notification.merchantReference}` : ''})`
      )
    }
  } catch (error) {
    if (CsPayError.isCsPayError(error) && error.code === 'WEBHOOK_VERIFICATION_FAILED') {
      console.warn('[paxity:webhook] notification rejetée : secret invalide')
      throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
    }

    console.error('[paxity:webhook] traitement échoué :', (error as Error)?.message)
  }

  return { received: true }
})
