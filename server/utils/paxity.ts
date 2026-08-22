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
    ...(config.paxityWebhookSecret ? { webhookSecret: String(config.paxityWebhookSecret) } : {}),
    // Le paiement par carte n'est ouvert que si Paxity a habilité le business —
    // sans quoi l'endpoint répond 403. Voir server/api/payment/paxity/card.post.ts.
    enableCardPayments: String(config.paxityCardEnabled) === 'true',
    ...(config.paxityDeveloperAccountId
      ? { developerAccountId: String(config.paxityDeveloperAccountId) }
      : {})
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

/** Devise dans laquelle nos tarifs sont libellés. */
export const DEVISE_DE_REFERENCE = 'XOF'

/**
 * Devises sans sous-unité : un montant s'y exprime en nombre entier.
 *
 * Y envoyer des décimales fait rejeter la transaction par l'opérateur.
 */
const DEVISES_SANS_DECIMALE = new Set(['XOF', 'XAF', 'GNF'])

/**
 * Convertit un montant via Paxity.
 *
 * `GET /manage/convert` — l'endpoint réel, malgré une documentation qui annonce
 * `/transaction/convert`. Il renvoie un nombre nu, pas un objet JSON.
 *
 * Le calcul reste côté serveur : c'est lui qui décide combien est encaissé, le
 * navigateur ne fait que l'afficher.
 */
export async function convertirMontant(
  montant: number,
  deVersDevise: string
): Promise<number> {
  const devise = String(deVersDevise || '').toUpperCase()
  if (!devise || devise === DEVISE_DE_REFERENCE) return montant

  const config = useRuntimeConfig()
  const base = String(config.paxityBaseUrl || 'https://transaction.paxity.io/api/v1')
    .replace(/\/$/, '')

  let brut: unknown
  try {
    brut = await $fetch(`${base}/manage/convert`, {
      query: {
        fromCurrency: DEVISE_DE_REFERENCE,
        toCurrency: devise,
        amount: montant
      },
      headers: {
        'x-api-key': String(config.paxityApiKey || ''),
        'X-API-TOKEN': String(config.paxityApiToken || '')
      }
    })
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Le taux de change est indisponible. Réessayez dans un instant.'
    })
  }

  const converti = Number(brut)
  if (!Number.isFinite(converti) || converti <= 0) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Le taux de change renvoyé est inexploitable.'
    })
  }

  // Arrondi au plus proche centime, ou à l'unité pour les devises qui n'ont pas
  // de sous-unité. On arrondit vers le haut : mieux vaut encaisser un centime
  // de trop que de laisser une conversion grignoter le prix à chaque vente.
  return DEVISES_SANS_DECIMALE.has(devise)
    ? Math.ceil(converti)
    : Math.ceil(converti * 100) / 100
}

/**
 * Opérateurs ivoiriens, identifiés par les deux premiers chiffres du numéro.
 *
 * Depuis la renumérotation de 2021, un numéro ivoirien tient sur dix chiffres
 * dont les deux premiers désignent l'opérateur — le zéro de tête en fait partie.
 */
const CI_OPERATORS = [
  // Moov n'a pas de méthode ivoirienne au catalogue Paxity : un numéro Moov
  // n'est encaissable qu'via Wave, d'où l'absence de `method`.
  { id: 'MOOV', label: 'Moov', prefixes: ['01', '02', '03'], method: null },
  { id: 'MTN', label: 'MTN', prefixes: ['04', '05', '06'], method: 'MTN Mobile Money' },
  { id: 'ORANGE', label: 'Orange', prefixes: ['07', '08', '09'], method: 'Orange Money' }
] as const

/**
 * Méthodes dont l'opérateur est imposé.
 *
 * `WAVECI` en est volontairement absent : Wave est un compte fintech, pas un
 * opérateur, et fonctionne avec n'importe quel numéro ivoirien.
 */
const CI_METHOD_OPERATOR: Record<string, string> = {
  MTNCI: 'MTN',
  OMCI: 'ORANGE'
}

/**
 * Refuse un numéro qui n'appartient pas à l'opérateur du moyen choisi.
 *
 * Sans ce garde-fou, la transaction part chez Paxity, est acceptée, puis
 * rejetée par l'opérateur une minute plus tard sans motif exploitable : c'est
 * ce qui a fait échouer toutes les tentatives MTN d'août 2026, payées avec des
 * numéros en 07 (donc Orange).
 *
 * Le contrôle ne tranche que sur preuve positive d'incompatibilité. Un préfixe
 * inconnu au plan de numérotation passe : mieux vaut laisser Paxity refuser un
 * numéro exotique que bloquer un paiement légitime sur une règle incomplète.
 */
export function assertPhoneMatchesMethod(
  methodId: string,
  localNumber: string,
  country: string
) {
  if (String(country || '').toUpperCase() !== 'CI') return

  const expectedId = CI_METHOD_OPERATOR[String(methodId || '').toUpperCase()]
  if (!expectedId) return

  const head = String(localNumber || '').slice(0, 2)
  const actual = CI_OPERATORS.find((operator) => operator.prefixes.includes(head))
  if (!actual || actual.id === expectedId) return

  const expected = CI_OPERATORS.find((operator) => operator.id === expectedId)!
  const attendus = expected.prefixes.slice(0, -1).join(', ') +
    ` ou ${expected.prefixes[expected.prefixes.length - 1]}`

  // Renvoyer vers l'opérateur du numéro n'a de sens que s'il est encaissable.
  // Sinon Wave prend le relais : c'est un compte fintech, pas un opérateur, et
  // il accepte n'importe quel numéro ivoirien.
  const alternative = actual.method
    ? `Choisissez ${actual.method}`
    : `${actual.label} n'est pas pris en charge en Côte d'Ivoire — choisissez Wave`

  throw createError({
    statusCode: 400,
    statusMessage:
      `Ce numéro commence par ${head} : c'est un numéro ${actual.label}. ` +
      `Les numéros ${expected.label} commencent par ${attendus}. ` +
      `${alternative}, ou saisissez un numéro ${expected.label}.`
  })
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
    // Erreur levée avant tout appel réseau : c'est une validation locale, dont
    // le message est précis et sûr (il ne contient jamais de donnée de carte).
    // Le transmettre tel quel aide l'utilisateur à corriger sa saisie.
    if (error.httpStatus === undefined && error.code === 'INVALID_REQUEST') {
      return createError({
        statusCode: 400,
        statusMessage: error.message,
        data: { code: error.code }
      })
    }

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
  // Ni `__h3_error__` ni `name === 'H3Error'` ne sont garantis d'une version de
  // h3 à l'autre : un `createError({ statusCode, statusMessage })` légitime
  // était pris pour une erreur inconnue et réemballé en 500 générique, ce qui
  // masquait son message. La présence du couple statusCode/statusMessage
  // suffit à l'identifier — une CsPayError porte `httpStatus`, pas `statusCode`.
  return (
    candidate.__h3_error__ === true ||
    candidate.name === 'H3Error' ||
    (typeof candidate.statusCode === 'number' && typeof candidate.statusMessage === 'string')
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
