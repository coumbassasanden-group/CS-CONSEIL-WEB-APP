/**
 * Mode test : montants ramenés à 100 F.
 *
 * Activé par l'URL, sur toute route dont le dernier segment se termine par
 * `-test` — `/fr/subscriber/manage-test` aujourd'hui. Cela évite de dupliquer
 * des pages entières : la page de test rend le même composant, seul le tarif
 * change.
 *
 * Le montant reste décidé côté navigateur, comme le prix normal : c'est un
 * outil de recette, pas une remise. Ne pas exposer ces URL aux clients.
 */

/** Tarif appliqué en recette, en FCFA. */
export const MONTANT_TEST = 100

export const useModeTest = () => {
  const route = useRoute()

  const actif = computed(() => /-test\/?$/.test(route.path))

  /** Renvoie le tarif de recette si le mode est actif, le tarif réel sinon. */
  const tarif = (reel: number) => (actif.value && reel > 0 ? MONTANT_TEST : reel)

  return { actif, tarif, MONTANT_TEST }
}
