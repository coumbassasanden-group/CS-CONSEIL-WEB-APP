/**
 * Composable pour gérer l'authentification et les données de session
 * Permet d'accéder facilement aux données sauvegardées dans localStorage
 */

export const useAuth = () => {
  /**
   * Récupère les données de l'utilisateur connecté
   */
  const getAuthUser = () => {
    if (process.server) return null
    const authUser = localStorage.getItem('authUser')
    return authUser ? JSON.parse(authUser) : null
  }

  /**
   * Récupère le token JWT
   */
  const getAuthToken = () => {
    if (process.server) return null
    return localStorage.getItem('authToken')
  }

  /**
   * Récupère l'email de l'utilisateur connecté
   */
  const getUserEmail = () => {
    const user = getAuthUser()
    return user?.email || null
  }

  /**
   * Récupère le prénom de l'utilisateur connecté
   */
  const getUserFirstName = () => {
    const user = getAuthUser()
    return user?.firstName || null
  }

  /**
   * Récupère le nom de l'utilisateur connecté
   */
  const getUserLastName = () => {
    const user = getAuthUser()
    return user?.lastName || null
  }

  /**
   * Récupère le nom complet de l'utilisateur
   */
  const getUserFullName = () => {
    const user = getAuthUser()
    if (!user) return null
    return `${user.firstName} ${user.lastName}`
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  const getUserId = () => {
    const user = getAuthUser()
    return user?.id || null
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  const getUserRole = () => {
    const user = getAuthUser()
    return user?.role || null
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  const isLoggedIn = () => {
    if (process.server) return false
    return !!localStorage.getItem('authToken')
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string) => {
    return getUserRole() === role
  }

  /**
   * Récupère l'heure de connexion
   */
  const getLoginTime = () => {
    if (process.server) return null
    const authData = localStorage.getItem('authData')
    if (!authData) return null
    const data = JSON.parse(authData)
    return data.loginTime || null
  }

  /**
   * Sauvegarde les données de connexion dans localStorage
   */
  const setAuthData = (user: any, token: string) => {
    if (process.server) return
    localStorage.setItem('authUser', JSON.stringify(user))
    localStorage.setItem('authToken', token)
    localStorage.setItem('authData', JSON.stringify({
      user,
      token,
      loginTime: new Date().toISOString()
    }))
  }

  /**
   * Déconnecte l'utilisateur et nettoie les données
   */
  const logout = () => {
    if (process.server) return
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authData')
    
    // Optionnel: nettoyer aussi les données d'abonnement
    localStorage.removeItem('selectedPlan')
    localStorage.removeItem('userVerification')
  }

  /**
   * Crée un header d'authentification pour les requêtes API
   */
  const getAuthHeader = () => {
    const token = getAuthToken()
    if (!token) return {}
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Récupère toutes les données de l'utilisateur
   */
  const getFullAuthData = () => {
    if (process.server) return null
    const authData = localStorage.getItem('authData')
    return authData ? JSON.parse(authData) : null
  }

  return {
    getAuthUser,
    getAuthToken,
    getUserEmail,
    getUserFirstName,
    getUserLastName,
    getUserFullName,
    getUserId,
    getUserRole,
    isLoggedIn,
    hasRole,
    getLoginTime,
    setAuthData,
    logout,
    getAuthHeader,
    getFullAuthData
  }
}
