import type { PaxityPaymentMethod } from '~/composables/usePaxityCheckout'

/**
 * Moyens de paiement par pays, pour tous les écrans de paiement.
 *
 * Le catalogue Paxity couvre onze pays africains. On le charge en entier une
 * fois, on présélectionne le pays du visiteur (déduit de son IP côté serveur),
 * et on le laisse en changer : un Sénégalais en déplacement à Abidjan doit
 * pouvoir payer avec son Wave sénégalais.
 *
 * Le choix du pays ne touche qu'à l'affichage. Le montant encaissé et sa
 * devise restent décidés côté serveur à partir du moyen choisi.
 */

/** Libellés français des pays du catalogue Paxity. */
export const NOMS_PAYS: Record<string, string> = {
  BF: 'Burkina Faso',
  BJ: 'Bénin',
  CI: "Côte d'Ivoire",
  CM: 'Cameroun',
  GH: 'Ghana',
  GN: 'Guinée',
  KE: 'Kenya',
  ML: 'Mali',
  NG: 'Nigeria',
  SN: 'Sénégal',
  TG: 'Togo'
}

/** Pays de repli quand la géolocalisation ne tranche pas. */
const PAYS_PAR_DEFAUT = 'CI'

export const usePaymentCountries = () => {
  const tous = ref<PaxityPaymentMethod[]>([])
  const paysChoisi = ref('')
  const chargement = ref(false)
  const erreur = ref('')

  /** Pays présents au catalogue, triés par nom, le pays détecté en tête. */
  const pays = computed(() => {
    const codes = [...new Set(tous.value.map((m) => String(m.country).toUpperCase()))]
    return codes
      .map((code) => ({ code, nom: NOMS_PAYS[code] || code }))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  })

  /** Moyens du pays choisi — ou tout le catalogue si le pays n'en a aucun. */
  const moyensDuPays = computed(() => {
    const code = paysChoisi.value.toUpperCase()
    const filtres = tous.value.filter((m) => String(m.country).toUpperCase() === code)
    return filtres.length ? filtres : tous.value
  })

  const charger = async () => {
    if (tous.value.length) return
    chargement.value = true
    erreur.value = ''
    try {
      const [methodes, visiteur] = await Promise.all([
        $fetch<PaxityPaymentMethod[]>('/api/payment/paxity/methods', { query: { country: 'all' } }),
        $fetch<{ country: string | null }>('/api/payment/paxity/visitor-country').catch(() => ({ country: null }))
      ])
      tous.value = methodes
      const detecte = String(visiteur?.country || '').toUpperCase()
      const codes = new Set(methodes.map((m) => String(m.country).toUpperCase()))
      // Un visiteur hors zone (France, Madagascar…) tombe sur la Côte d'Ivoire,
      // le pays du site, plutôt que sur une liste vide.
      paysChoisi.value = codes.has(detecte) ? detecte : PAYS_PAR_DEFAUT
    } catch (err: any) {
      erreur.value = err?.data?.statusMessage || err?.message || 'Impossible de charger les moyens de paiement'
      throw err
    } finally {
      chargement.value = false
    }
  }

  return { pays, paysChoisi, moyensDuPays, charger, chargement, erreur, tous }
}

/**
 * Montant réellement débité quand le moyen choisi n'est pas libellé en XOF.
 *
 * Purement informatif — le serveur refait la conversion à l'encaissement.
 * Sans cette mention, un client verrait « 2 000 FCFA » puis « 37,60 GHS » sur
 * son relevé, sans explication.
 */
export const useMontantConverti = (
  montant: () => number,
  devise: () => string | undefined | null
) => {
  const converti = ref<{ to: string; amount: number; convertedAmount: number } | null>(null)
  const chargement = ref(false)

  const rafraichir = async () => {
    const d = String(devise() || '').toUpperCase()
    if (!d || d === 'XOF') {
      converti.value = null
      return
    }
    chargement.value = true
    try {
      converti.value = await $fetch('/api/payment/paxity/convert', {
        query: { amount: montant(), currency: d }
      })
    } catch {
      // Un taux indisponible n'empêche pas de payer ; on n'annonce rien.
      converti.value = null
    } finally {
      chargement.value = false
    }
  }

  watch([montant, devise], rafraichir, { immediate: true })

  return { converti, chargement }
}
