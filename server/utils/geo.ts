import { open, type Reader } from 'maxmind'

/**
 * Pays du visiteur, déduit de son adresse IP.
 *
 * La résolution se fait sur une base DB-IP locale : aucun appel réseau, donc
 * aucune latence ni dépendance à un tiers sur un écran de paiement.
 *
 * Tout échec est silencieux et renvoie `null`. L'appelant doit alors montrer
 * l'offre complète : mieux vaut proposer trop de moyens de paiement que
 * d'afficher une liste vide à un client qui voulait payer.
 */

type CityRecord = { country?: { iso_code?: string } }

let lecteur: Reader<CityRecord> | null | undefined
let chargement: Promise<Reader<CityRecord> | null> | undefined

/** Plages privées, boucle locale et lien-local : rien à y géolocaliser. */
const IP_NON_PUBLIQUE =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:|f[cd][0-9a-f]{2}:)/i

const obtenirLecteur = async (): Promise<Reader<CityRecord> | null> => {
  if (lecteur !== undefined) return lecteur
  if (chargement) return chargement

  const config = useRuntimeConfig()
  const chemin = String(config.geoipDbPath || '')

  if (!chemin) {
    lecteur = null
    return null
  }

  chargement = open<CityRecord>(chemin)
    .then((r) => {
      lecteur = r
      return r
    })
    .catch((error) => {
      // La base appartient à une autre application : elle peut disparaître ou
      // changer de place. On le signale une fois, puis on s'en passe.
      console.warn('[geo] base introuvable ou illisible, géolocalisation désactivée :', String(error))
      lecteur = null
      return null
    })

  return chargement
}

/** Extrait l'IP réelle du visiteur derrière le proxy nginx. */
export function ipDuVisiteur(event: any): string {
  const headers = getRequestHeaders(event)

  // `X-Forwarded-For` accumule les relais : le client est en tête de liste.
  const transmis = String(headers['x-forwarded-for'] || '').split(',')[0]?.trim()
  if (transmis) return transmis

  return String(headers['x-real-ip'] || '').trim()
}

/**
 * Code pays ISO du visiteur, ou `null` si indéterminable.
 */
export async function paysDuVisiteur(event: any): Promise<string | null> {
  const ip = ipDuVisiteur(event)
  if (!ip || IP_NON_PUBLIQUE.test(ip)) return null

  const reader = await obtenirLecteur()
  if (!reader) return null

  try {
    const code = reader.get(ip)?.country?.iso_code
    return code ? String(code).toUpperCase() : null
  } catch {
    return null
  }
}
