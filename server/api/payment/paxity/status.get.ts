import { getPaxity, toHttpError } from '../../../utils/paxity'

/**
 * État réel d'une transaction, lu auprès de Paxity.
 *
 * `GET /api/payment/paxity/status?reference=...`
 *
 * C'est la source de vérité : un webhook Paxity n'est pas signé et ne prouve
 * rien à lui seul. À interroger avant de valider un abonnement, et en boucle
 * pendant qu'une méthode `PUSH` attend la validation du payeur.
 */
export default defineEventHandler(async (event) => {
  const { reference } = getQuery(event)

  if (!reference) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre `reference` requis' })
  }

  try {
    const transaction = await getPaxity().getPayment({ reference: String(reference) })

    return {
      reference: transaction.reference,
      merchantReference: transaction.merchantReference ?? null,
      status: transaction.status,
      amount: transaction.amount,
      netAmount: transaction.netAmount ?? null,
      currency: transaction.currency,
      method: transaction.method ?? null,
      createdAt: transaction.createdAt ?? null,
      updatedAt: transaction.updatedAt ?? null
    }
  } catch (error) {
    throw toHttpError(error)
  }
})
