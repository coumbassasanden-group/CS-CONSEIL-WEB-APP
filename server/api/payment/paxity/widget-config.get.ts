/**
 * Paramètres nécessaires au widget de paiement Paxity.
 *
 * `GET /api/payment/paxity/widget-config`
 *
 * ⚠️ Ces valeurs partent forcément au navigateur : le widget de Paxity exige
 * `credentials.apiKey` et `credentials.apiToken` côté client, c'est sa
 * conception. Les servir depuis une route plutôt que de les inliner dans le
 * bundle ne les rend pas secrètes — n'importe qui peut appeler cette route —
 * mais évite qu'elles dorment dans un fichier JavaScript statique mis en cache
 * et indexable, et permet de les révoquer sans reconstruire l'application.
 *
 * À demander à Paxity : une clé à portée restreinte, limitée à l'encaissement.
 */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  if (String(config.public?.paxityCardWidget) !== 'true') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Widget de paiement désactivé.'
    })
  }

  return {
    apiKey: String(config.paxityApiKey || ''),
    apiToken: String(config.paxityApiToken || ''),
    developerAccountId: String(config.paxityDeveloperAccountId || '')
  }
})
