import { getPaxity, toHttpError } from '../../../utils/paxity'
import { paysDuVisiteur } from '../../../utils/geo'

/**
 * Moyens de paiement Paxity disponibles.
 *
 * `GET /api/payment/paxity/methods?country=CI&currency=XOF`
 *
 * Sans paramètre `country`, la liste est restreinte au pays du visiteur, déduit
 * de son IP. Passer `country=all` force le catalogue complet.

 * Les deux filtres sont facultatifs et cumulables. `currency` compte plus que
 * `country` pour nous : nos tarifs sont libellés en XOF et `checkout.post.ts`
 * facture dans la devise de la méthode choisie. Servir une méthode en GHS
 * ferait payer « 2000 GHS » une édition à 2000 XOF.
 *
 * L'endpoint Paxity correspondant est public, mais il est relayé ici pour deux
 * raisons : garder une seule origine côté navigateur, et renvoyer une forme
 * stable ({ id, name, logo }) identique à celle que consommait déjà le
 * sélecteur de moyens de paiement.
 */
export default defineEventHandler(async (event) => {
  const { country, currency } = getQuery(event)

  // `country` explicite : l'appelant sait ce qu'il veut, on ne le contredit pas.
  // Sinon on tente le pays du visiteur — un Sénégalais n'a que faire d'un
  // opérateur togolais.
  const force = String(country || '').toLowerCase() === 'all'
  const paysDemande = !force && country
    ? String(country)
    : (force ? '' : ((await paysDuVisiteur(event)) || ''))

  try {
    const methods = await getPaxity().listMethods({})

    const devise = currency ? String(currency).toUpperCase() : ''

    const actifs = methods
      .filter((method) => method.active)
      .filter((method) => !devise || String(method.currency).toUpperCase() === devise)

    // Le filtre par pays ne s'applique que s'il laisse quelque chose. Un
    // visiteur français, ou mal géolocalisé, doit voir l'offre entière plutôt
    // qu'une liste vide qui l'empêcherait de payer.
    const duPays = paysDemande
      ? actifs.filter((m) => String(m.country).toUpperCase() === paysDemande.toUpperCase())
      : []

    const retenus = duPays.length ? duPays : actifs

    return retenus
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
