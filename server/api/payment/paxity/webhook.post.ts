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
 * Sur un paiement réussi, ce gestionnaire **enregistre l'achat** auprès du
 * backend. C'est indispensable pour la carte bancaire : le widget Paxity ne
 * revient jamais vers le site, et sans ce relais un paiement par carte était
 * encaissé sans jamais débloquer quoi que ce soit. Cela couvre aussi l'onglet
 * fermé avant la confirmation et la redirection opérateur qui ne revient pas.
 *
 * La page de suivi (`pages/payment/success.vue`) continue de finaliser de son
 * côté : le backend est idempotent, le premier arrivé gagne, l'autre retrouve
 * l'enregistrement existant.
 *
 * La référence marchand porte tout ce qu'il faut pour finaliser sans état :
 *   ED-{édition}-S{abonné}-{horodatage}     → achat d'une édition
 *   SUB-{plan}-S{abonné}-{horodatage}       → abonnement à un plan
 */
const REF_EDITION = /^ED-(\d+)-S(\d+)-/
const REF_ABONNEMENT = /^SUB-([a-z_]+)-S(\d+)-/

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

      if (notification.status === 'SUCCESS') {
        await finaliser(notification).catch((error) => {
          // L'échec ne doit pas remonter à Paxity (il rejouerait), mais il doit
          // être visible : c'est un paiement encaissé sans contrepartie.
          console.error('[paxity:webhook] finalisation échouée :', (error as Error)?.message)
        })
      }
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

/** Applique le paiement côté backend, selon ce que dit la référence marchand. */
async function finaliser(notification: {
  reference: string
  merchantReference?: string
  amount: number
  currency: string
  method?: string | null
}) {
  const ref = String(notification.merchantReference || '')
  if (!ref) return

  // Paxity ne signe pas ses notifications et l'URL de rappel du widget carte
  // est composée dans le navigateur : n'importe qui peut donc poster un faux
  // « SUCCESS » ici. Avant d'agir, on relit la transaction chez Paxity — la
  // source de vérité — et on exige qu'elle soit réussie, pour le même montant.
  let verifiee
  try {
    verifiee = await getPaxity().getPayment({ reference: notification.reference })
  } catch {
    console.warn(`[paxity:webhook] ${notification.reference} inconnue de Paxity : notification ignorée`)
    return
  }
  if (verifiee.status !== 'SUCCESS' || Number(verifiee.amount) !== Number(notification.amount)) {
    console.warn(
      `[paxity:webhook] ${notification.reference} : Paxity dit ${verifiee.status} ${verifiee.amount}, ` +
      `la notification disait SUCCESS ${notification.amount} — ignorée`
    )
    return
  }

  const config = useRuntimeConfig()
  const secret = String(config.internalApiSecret || '')
  const base = String(config.public.apiBaseUrl || '').replace(/\/$/, '')

  if (!secret || !base) {
    console.warn('[paxity:webhook] finalisation impossible : INTERNAL_API_SECRET ou API_BASE_URL manquant')
    return
  }

  const appel = (chemin: string, corps: Record<string, unknown>) =>
    $fetch(`${base}${chemin}`, {
      method: 'POST',
      headers: { 'X-Internal-Secret': secret, Accept: 'application/json' },
      body: corps
    })

  const edition = ref.match(REF_EDITION)
  if (edition) {
    await appel('/api/subscription/purchase-edition', {
      subscription_id: Number(edition[2]),
      edition_id: Number(edition[1]),
      payment_reference: notification.reference,
      payment_method: notification.method ? `paxity:${notification.method}` : 'paxity',
      amount: notification.amount
    })
    console.log(`[paxity:webhook] achat enregistré : édition ${edition[1]} pour l'abonné ${edition[2]}`)
    return
  }

  const abonnement = ref.match(REF_ABONNEMENT)
  if (abonnement) {
    await appel('/api/subscription/internal/change-plan', {
      subscription_id: Number(abonnement[2]),
      planId: abonnement[1],
      transactionId: notification.reference,
      payment_method: notification.method ? `paxity:${notification.method}` : 'paxity'
    })
    console.log(`[paxity:webhook] plan ${abonnement[1]} appliqué à l'abonné ${abonnement[2]}`)
    return
  }

  // Ancien format de référence : la page de suivi s'en charge, comme avant.
  console.log(`[paxity:webhook] référence ${ref} sans identifiant d'abonné : finalisation laissée au navigateur`)
}
