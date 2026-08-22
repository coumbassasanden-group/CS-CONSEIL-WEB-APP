export default defineNuxtRouteMiddleware((to, from) => {
  // Cette fonction s'exécute uniquement côté client après l'hydratation
  // Dans un middleware Nuxt 3, on évite les appels SSR directs

  // Seulement côté client (processus SSR)
  if (process.server) {
    return
  }

  // Récupérer le token d'authentification depuis localStorage
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const authUserStr = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null

  // Routes protégées qui nécessitent une authentification
  // Vérifier si on accède à la route manage
  const isManageRoute = to.path.includes('/subscriber/manage')
  const isSuccessRoute = to.path.includes('/subscriber/success')

  // Protection de la route /subscriber/manage
  if (isManageRoute) {
    if (!authToken || !authUserStr) {
      console.warn('❌ Authentification requise pour accéder à /subscriber/manage')

      // Récupérer la locale depuis l'URL
      const locale = to.params.locale || 'fr'

      // Rediriger vers la page alt-news
      return navigateTo(`/${locale}/alt-news`)
    }

    // Le jeton suffit à rester connecté. Le statut mémorisé ici n'est qu'un
    // instantané pris à la connexion : un étudiant en attente de validation
    // était déconnecté à chaque visite, et l'instantané ne se corrigeait
    // jamais — même une fois son compte validé par l'administration.
    //
    // C'est la page qui décide de ce qu'elle affiche à partir du profil
    // rechargé, et l'accès au premium est contrôlé côté serveur.
    try {
      const authUser = JSON.parse(authUserStr)
      console.log('✅ Session valide pour', authUser.email)
    } catch (error) {
      // Donnée illisible : là, le nettoyage est justifié.
      console.error('❌ Session illisible, nettoyage :', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('authData')
      const locale = to.params.locale || 'fr'
      return navigateTo(`/${locale}/alt-news`)
    }
  }

  // Si l'utilisateur est authentifié et accède à /subscriber/success
  // et qu'il a un plan sélectionné, rediriger vers /subscriber/manage
  if (isSuccessRoute && authToken && authUserStr) {
    const selectedPlan = localStorage.getItem('selectedPlan')
    if (selectedPlan) {
      const locale = to.params.locale || 'fr'
      console.log('➡️ Redirection automatique: /subscriber/success → /subscriber/manage')
      return navigateTo(`/${locale}/subscriber/manage`)
    }
  }
})
