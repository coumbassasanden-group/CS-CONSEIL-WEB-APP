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
      
      // Rediriger vers la page de sélection des plans
      return navigateTo(`/${locale}/subscriber`)
    }

    // Vérifier que le token et l'utilisateur sont valides
    try {
      const authUser = JSON.parse(authUserStr)
      
      // Vérifier que l'utilisateur est actif
      if (!authUser.isActive) {
        console.warn('⚠️ Compte utilisateur inactif')
        const locale = to.params.locale || 'fr'
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('authData')
        return navigateTo(`/${locale}/subscriber`)
      }
      
      console.log('✅ Authentification valide pour', authUser.email)
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('authData')
      const locale = to.params.locale || 'fr'
      return navigateTo(`/${locale}/subscriber`)
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
