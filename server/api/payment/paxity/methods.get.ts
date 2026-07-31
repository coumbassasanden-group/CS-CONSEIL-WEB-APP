import { getPaxity, toHttpError } from '../../../utils/paxity'

/**
 * Moyens de paiement Paxity disponibles.
 *
 * `GET /api/payment/paxity/methods?country=CI`
 *
 * L'endpoint Paxity correspondant est public, mais il est relayé ici pour deux
 * raisons : garder une seule origine côté navigateur, et renvoyer une forme
 * stable ({ id, name, logo }) identique à celle que consommait déjà le
 * sélecteur de moyens de paiement.
 */
export default defineEventHandler(async (event) => {
  const { country } = getQuery(event)

  try {
    const methods = await getPaxity().listMethods(
      country ? { country: String(country) } : {}
    )

    return methods
      .filter((method) => method.active)
      .map((method) => ({
        id: method.id,
        name: method.name,
        logo: method.logoUrl ?? null,
        type: method.type,
        currency: method.currency,
        country: method.country,
        phonePrefix: method.phonePrefix ?? null,
        instructions: method.instructions ?? null
      }))
  } catch (error) {
    throw toHttpError(error)
  }
})
