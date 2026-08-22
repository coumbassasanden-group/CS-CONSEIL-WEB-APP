import { paysDuVisiteur } from '../../../utils/geo'

/**
 * Pays du visiteur, déduit de son IP.
 *
 * `GET /api/payment/paxity/visitor-country` → `{ country: 'CI' | null }`
 *
 * Sert à présélectionner le pays dans le choix des moyens de paiement. `null`
 * quand la base de géolocalisation ne tranche pas : l'écran prend alors le
 * pays par défaut.
 */
export default defineEventHandler(async (event) => ({
  country: await paysDuVisiteur(event)
}))
