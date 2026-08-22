import { DEVISE_DE_REFERENCE, convertirMontant } from '../../../utils/paxity'

/**
 * Montant réellement encaissé pour un tarif exprimé en XOF.
 *
 * `GET /api/payment/paxity/convert?amount=2000&currency=GHS`
 *
 * Sert uniquement à l'affichage : c'est `checkout.post.ts` qui refait le calcul
 * au moment de créer la transaction. Le navigateur ne choisit jamais le montant
 * encaissé, il se contente de l'annoncer au client avant qu'il ne valide.
 */
export default defineEventHandler(async (event) => {
  const { amount, currency } = getQuery(event)

  const montant = Number(amount)
  if (!Number.isFinite(montant) || montant <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide' })
  }

  const devise = String(currency || DEVISE_DE_REFERENCE).toUpperCase()

  // Pas de réemballage : `convertirMontant` lève déjà des erreurs h3 portant le
  // bon statut et un message affichable.
  return {
    from: DEVISE_DE_REFERENCE,
    to: devise,
    amount: montant,
    convertedAmount: await convertirMontant(montant, devise)
  }
})
