import { getPaxity, resolveMethod, splitPhone, toHttpError } from '../../../utils/paxity'

interface CheckoutBody {
  /** Identifiant de méthode Paxity, ex. `WAVECI`. */
  method: string
  /** Montant dans la devise de la méthode. */
  amount: number
  /** Téléphone du payeur, saisi librement. */
  phone: string
  /** Référence côté marchand, revient telle quelle dans le webhook. */
  reference?: string
  description?: string
  /** Code à usage unique, requis par les méthodes de type `OTP`. */
  otp?: string
}

/**
 * Initie un encaissement.
 *
 * `POST /api/payment/paxity/checkout`
 *
 * Deux issues selon la méthode :
 *  - `QR_CODE` → `redirectUrl` (et `qrCode`) : rediriger le payeur ;
 *  - `PUSH`    → aucune URL : le payeur valide sur son téléphone, l'appelant
 *                interroge `/status` ou attend le webhook.
 *
 * Pays, devise et indicatif ne sont pas lus dans la requête mais déduits de la
 * méthode : le navigateur ne doit pas pouvoir choisir la devise d'un paiement.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutBody>(event)

  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide' })
  }

  if (!body?.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone requis' })
  }

  const method = resolveMethod(body?.method)
  const phone = splitPhone(body.phone, method.phonePrefix)

  if (phone.number.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone incomplet' })
  }

  if (method.type === 'OTP' && !body.otp) {
    throw createError({
      statusCode: 400,
      statusMessage: `${method.name} exige un code de validation à usage unique.`
    })
  }

  const config = useRuntimeConfig()
  const secret = String(config.paxityWebhookSecret || '')
  const publicUrl = String(config.public?.siteUrl || '') || getRequestURL(event).origin

  try {
    const transaction = await getPaxity().createPayment({
      amount,
      currency: method.currency,
      country: method.country,
      method: method.id,
      phone,
      ...(body.reference ? { reference: String(body.reference) } : {}),
      ...(body.description ? { description: String(body.description) } : {}),
      ...(body.otp ? { otp: String(body.otp) } : {}),
      callbackUrl: `${publicUrl}/api/payment/paxity/webhook${secret ? `?secret=${encodeURIComponent(secret)}` : ''}`
    })

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      netAmount: transaction.netAmount ?? null,
      currency: transaction.currency,
      methodType: method.type,
      // Nommé `redirectUrl` pour rester interchangeable avec la réponse Jeko.
      redirectUrl: transaction.checkoutUrl ?? null,
      qrCode: transaction.qrCode ?? null,
      createdAt: transaction.createdAt ?? null
    }
  } catch (error) {
    throw toHttpError(error)
  }
})
