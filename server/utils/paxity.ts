import { CsPayError, PaxityProvider, findPaxityMethod } from 'cspay/paxity'
import type { PhoneNumber } from 'cspay/paxity'

/**
 * Accès à Paxity côté serveur uniquement.
 *
 * Les clés vivent dans `runtimeConfig` (privé), jamais dans `runtimeConfig.public` :
 * tout ce qui est public est inliné dans le bundle navigateur. C'est la
 * différence majeure avec l'intégration Jeko, où `checkoutApiBase` était exposé
 * et les appels partaient du navigateur.
 */

let provider: PaxityProvider | undefined

export function getPaxity(): PaxityProvider {
  if (provider) return provider

  const config = useRuntimeConfig()
  const apiKey = String(config.paxityApiKey || '')
  const apiToken = String(config.paxityApiToken || '')

  if (!apiKey || !apiToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Paxity non configuré : PAXITY_API_KEY et PAXITY_API_TOKEN sont requis côté serveur.'
    })
  }

  provider = new PaxityProvider({
    apiKey,
    apiToken,
    ...(config.paxityBearer ? { bearerToken: String(config.paxityBearer) } : {}),
    ...(config.paxityBaseUrl ? { baseUrl: String(config.paxityBaseUrl) } : {}),
    ...(config.paxityWebhookSecret ? { webhookSecret: String(config.paxityWebhookSecret) } : {})
  })

  return provider
}

/**
 * Découpe un numéro saisi librement en indicatif + numéro local.
 *
 * Le formulaire d'abonnement n'a qu'un seul champ téléphone, alors que Paxity
 * exige les deux séparément. L'indicatif attendu est déduit de la méthode
 * choisie : `WAVECI` implique la Côte d'Ivoire, donc `225`.
 */
export function splitPhone(raw: string, expectedPrefix: string): PhoneNumber {
  // Le zéro de tête d'un numéro local ne doit surtout pas être retiré : un
  // numéro ivoirien s'écrit 0700000000 sur dix chiffres, et Paxity rejette la
  // transaction si on l'ampute (constaté le 2026-07-31 — l'API répond
  // ERR_PROVIDER, sans message explicite).
  let digits = String(raw || '').replace(/\D/g, '')

  // Préfixe international composé : 00225… → 225…
  if (digits.startsWith('00')) digits = digits.slice(2)

  if (expectedPrefix && digits.startsWith(expectedPrefix)) {
    const local = digits.slice(expectedPrefix.length)
    // Un reste trop court signifie que ces chiffres faisaient partie du numéro
    // local, pas d'un indicatif : on ne les retire pas.
    if (local.length >= 6) return { prefix: expectedPrefix, number: local }
  }

  return { prefix: expectedPrefix, number: digits }
}

/**
 * Complète les paramètres d'un paiement à partir de la méthode choisie.
 *
 * Le client n'envoie que la méthode, le montant et le téléphone ; pays, devise
 * et indicatif viennent du catalogue, ce qui évite de faire confiance à des
 * valeurs venues du navigateur pour construire une transaction.
 */
export function resolveMethod(methodId: string) {
  const entry = findPaxityMethod(String(methodId || ''))

  if (!entry) {
    throw createError({
      statusCode: 400,
      statusMessage: `Méthode de paiement inconnue : ${methodId}`
    })
  }

  return entry
}

/** Traduit une `CsPayError` en réponse HTTP lisible, sans divulguer d'interne. */
export function toHttpError(error: unknown) {
  // Une erreur H3 (configuration manquante, validation) porte déjà le bon
  // statut et un message utile : la réemballer masquerait la cause réelle.
  if (isH3Error(error)) return error

  if (CsPayError.isCsPayError(error)) {
    const status =
      error.code === 'INVALID_REQUEST' || error.code === 'INVALID_PHONE' ? 400 :
      error.code === 'DUPLICATE_REFERENCE' ? 409 :
      error.code === 'INSUFFICIENT_BALANCE' ? 402 :
      error.code === 'UNAUTHENTICATED' || error.code === 'FORBIDDEN' ? 502 :
      502

    return createError({
      statusCode: status,
      statusMessage: messageFor(error.code),
      data: { code: error.code, providerCode: error.providerCode }
    })
  }

  // Erreur imprévue : elle n'atteint pas le client, donc elle doit atteindre
  // les logs — sans quoi le diagnostic est impossible.
  console.error('[paxity] erreur non gérée :', error)
  return createError({ statusCode: 500, statusMessage: 'Erreur interne du service de paiement' })
}

/** Reconnaît une erreur créée par `createError` de h3. */
function isH3Error(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as Record<string, unknown>
  return (
    candidate.__h3_error__ === true ||
    (typeof candidate.statusCode === 'number' && candidate.name === 'H3Error')
  )
}

/** Messages destinés à l'utilisateur final, en français. */
function messageFor(code: string): string {
  switch (code) {
    case 'INVALID_PHONE':
      return 'Numéro de téléphone invalide pour cet opérateur.'
    case 'INVALID_REQUEST':
      return 'Moyen de paiement indisponible pour ce montant ou cette devise.'
    case 'DUPLICATE_REFERENCE':
      return 'Un paiement est déjà en cours pour cette commande.'
    case 'ACCOUNT_FROZEN':
      return 'Le compte marchand est temporairement bloqué.'
    case 'RATE_LIMITED':
      return 'Trop de tentatives. Réessayez dans quelques minutes.'
    case 'TIMEOUT':
    case 'NETWORK_ERROR':
      return 'Le service de paiement ne répond pas. Vérifiez l\'état du paiement avant de réessayer.'
    default:
      return 'Le paiement n\'a pas pu être initié.'
  }
}
