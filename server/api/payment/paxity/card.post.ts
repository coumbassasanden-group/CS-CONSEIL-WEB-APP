import { getPaxity, toHttpError } from '../../../utils/paxity'

interface CardBody {
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

/**
 * Encaissement par carte bancaire.
 *
 * `POST /api/payment/paxity/card`
 *
 * ⚠️ Cette route reçoit un numéro de carte et un cryptogramme. Trois règles
 * s'appliquent et ne doivent jamais être assouplies :
 *
 * 1. **Rien n'est journalisé.** Aucun `console.log` du corps, même partiel.
 *    `cspay` marque l'appel comme sensible et n'attache pas la réponse du
 *    fournisseur à ses erreurs.
 * 2. **Rien n'est persisté.** Les données ne vivent que le temps de la requête.
 * 3. **Rien ne revient au client** hormis la référence et le statut.
 *
 * La route reste fermée tant que `NUXT_PAXITY_CARD_ENABLED` n'est pas à `true`,
 * car Paxity répond `403` sur cet endpoint tant que le business n'est pas
 * habilité. Voir `docs/demande-paxity-carte-bancaire.md` dans cspay.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (String(config.paxityCardEnabled) !== 'true') {
    throw createError({
      statusCode: 501,
      statusMessage: 'Le paiement par carte n\'est pas encore disponible.'
    })
  }

  const body = await readBody<CardBody>(event)

  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide' })
  }

  try {
    const transaction = await getPaxity().createCardPayment({
      amount,
      // La devise n'est pas lue dans le corps de la requête : le navigateur ne
      // doit pas pouvoir choisir dans quelle monnaie il est débité.
      currency: 'XOF',
      card: {
        number: String(body?.cardNumber ?? ''),
        expiryMonth: String(body?.expiryMonth ?? ''),
        expiryYear: String(body?.expiryYear ?? ''),
        cvv: String(body?.cvv ?? ''),
        holderFirstName: String(body?.holderFirstName ?? ''),
        holderLastName: String(body?.holderLastName ?? '')
      },
      ...(body?.reference ? { reference: String(body.reference) } : {}),
      ...(body?.description ? { description: String(body.description) } : {})
    })

    return {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      methodType: 'CARD' as const,
      // Présent si la banque exige une authentification 3-D Secure.
      redirectUrl: transaction.checkoutUrl ?? null,
      qrCode: null,
      netAmount: transaction.netAmount ?? null,
      createdAt: transaction.createdAt ?? null
    }
  } catch (error) {
    // `toHttpError` ne remonte jamais le corps du fournisseur : sur un appel
    // sensible, cspay l'a déjà écarté.
    throw toHttpError(error)
  } finally {
    // Coupe court à toute rétention accidentelle du corps de la requête.
    if (body) {
      body.cardNumber = ''
      body.cvv = ''
    }
  }
})
