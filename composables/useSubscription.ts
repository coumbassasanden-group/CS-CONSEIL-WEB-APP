export const useSubscription = () => {
  const config = useRuntimeConfig()
  const router = useRouter()

  // Plans d'abonnement (données de fallback)
  const subscriptionPlans = ref<any[]>([])
  const plansLoading = ref(false)
  const plansError = ref('')

  // État de l'abonnement actuel
  const currentSubscription = ref<any>(null)
  const subscriptionLoading = ref(false)
  const subscriptionError = ref('')

  // État de vérification d'email
  const emailCheckLoading = ref(false)
  const emailCheckError = ref('')
  const userExists = ref(false)
  const existingUserData = ref<any>(null)

  // État du formulaire
  const subscriptionForm = ref({
    userId: null as string | null,
    planId: null as string | null,
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    studentProof: null as File | null, // Justificatif étudiant
    acceptTerms: false,
    newsletter: true,
    transactionId: '' // ID de transaction pour le paiement
  })

  // État du processus
  const isProcessing = ref(false)
  const processingStep = ref<'form' | 'payment' | 'confirmation'>('form')
  const errorMessage = ref('')

  // Témoignages clients
  const testimonials = ref([
    {
      id: 1,
      name: 'Aminata Diallo',
      role: 'Journaliste',
      company: 'Radio Nationale',
      avatar: '👩‍💼',
      rating: 5,
      comment: 'L\'abonnement annuel me permet d\'accéder à toutes les éditions ALT News. Excellent rapport qualité-prix à 20 000 FCFA !',
      date: '2025-11-15'
    },
    {
      id: 2,
      name: 'Mamadou Konaté',
      role: 'Étudiant en Sciences Politiques',
      company: 'Université de Bamako',
      avatar: '🎓',
      rating: 5,
      comment: 'Le tarif étudiant à 10 000 FCFA est parfait pour mon budget. Je reçois toutes les éditions chaque mois.',
      date: '2025-10-22'
    },
    {
      id: 3,
      name: 'Fatou Traoré',
      role: 'Chef d\'Entreprise',
      company: 'Traoré & Associés',
      avatar: '👩',
      rating: 5,
      comment: 'L\'abonnement mensuel me convient parfaitement. Simple et efficace !',
      date: '2025-11-05'
    }
  ])

  // FAQ - Questions fréquentes
  const faqs = ref([
    {
      id: 1,
      question: 'Comment recevoir les éditions ALT News ?',
      answer: 'Toutes les éditions sont envoyées automatiquement par e-mail au format PDF. Pour l\'abonnement mensuel, vous recevez l\'édition du mois en cours. Pour l\'annuel, vous recevez automatiquement les 12 éditions tout au long de l\'année.'
    },
    {
      id: 2,
      question: 'Quels sont les moyens de paiement acceptés ?',
      answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, MTN Mobile Money, Moov Money), cartes bancaires et virements bancaires.'
    },
    {
      id: 3,
      question: 'Comment bénéficier du tarif étudiant ?',
      answer: 'Le tarif étudiant à 10 000 FCFA/an nécessite un justificatif de statut étudiant (carte d\'étudiant ou certificat de scolarité). Envoyez votre justificatif lors de votre inscription.'
    },
    {
      id: 4,
      question: 'Quelle est la différence entre l\'achat à l\'unité et l\'abonnement mensuel ?',
      answer: 'L\'achat à l\'unité vous permet d\'acheter une édition spécifique pour 2 000 FCFA. L\'abonnement mensuel vous donne accès à l\'édition du mois en cours et se renouvelle automatiquement.'
    },
    {
      id: 5,
      question: 'L\'abonnement gratuit donne-t-il accès aux éditions ?',
      answer: 'Non, l\'abonnement gratuit vous permet uniquement de recevoir notre newsletter d\'actualités et de promotions. Pour accéder aux éditions PDF, vous devez souscrire à un abonnement Premium.'
    }
  ])

  // Statistiques ALT News
  const stats = ref({
    subscribers: '5,000+',
    editions: '120+',
    satisfaction: '95%',
    years: '10+'
  })

  // Méthodes API
  /**
   * Vérifier si un email existe déjà dans le système
   * Si oui, retourne les données de l'utilisateur existant
   */
  const checkEmail = async (email: string) => {
    emailCheckLoading.value = true
    emailCheckError.value = ''
    userExists.value = false
    existingUserData.value = null

    try {
      const response = await fetch(`${config.public.apiSubcriptionUrl}auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.exists) {
        // L'email existe - pré-remplir le formulaire
        userExists.value = true
        existingUserData.value = data
        
        // Pré-remplir le formulaire avec les données existantes
        subscriptionForm.value.userId = data.id || null
        subscriptionForm.value.email = data.email || ''
        subscriptionForm.value.firstName = data.firstName || ''
        subscriptionForm.value.lastName = data.lastName || ''
        subscriptionForm.value.phone = data.phone || ''
        
        console.log('Utilisateur existant trouvé:', data)
        return { exists: true, user: data }
      } else {
        // L'email n'existe pas - nouvel utilisateur
        userExists.value = false
        existingUserData.value = null
        console.log('Email non trouvé - nouvel utilisateur')
        return { exists: false }
      }
    } catch (error) {
      emailCheckError.value = 'Erreur lors de la vérification de l\'email'
      console.error('Erreur checkEmail:', error)
      return { exists: false, error: true }
    } finally {
      emailCheckLoading.value = false
    }
  }

  /**
   * Créer un nouveau compte utilisateur
   */
  const registerUser = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    isProcessing.value = true
    errorMessage.value = ''

    try {
      const payload = {
        email,
        password,
        firstName,
        lastName,
        phone
      }

      const response = await fetch(`${config.public.apiSubcriptionUrl}auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // L'API retourne { user, token } en cas de succès
      if (data.user) {
        // Utilisateur créé avec succès
        console.log('Utilisateur créé avec succès:', data.user)
        
        // Stocker le token si nécessaire
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
        
        // Pré-remplir automatiquement le formulaire
        subscriptionForm.value.userId = data.user.id || null
        subscriptionForm.value.email = data.user.email || email
        subscriptionForm.value.firstName = data.user.firstName || firstName
        subscriptionForm.value.lastName = data.user.lastName || lastName
        subscriptionForm.value.phone = data.user.phone || phone

        return { success: true, user: data.user, token: data.token }
      } else {
        throw new Error(data.message || 'Erreur lors de la création du compte')
      }
    } catch (error: any) {
      errorMessage.value = error.message || 'Erreur lors de la création du compte'
      console.error('Erreur registerUser:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Parser les features JSON si nécessaire
   */
  const parseFeatures = (features: any): string[] => {
    if (Array.isArray(features)) {
      return features
    }
    if (typeof features === 'string') {
      try {
        return JSON.parse(features)
      } catch (e) {
        console.warn('Impossible de parser les features:', features)
        return []
      }
    }
    return []
  }

  /**
   * Normaliser un plan pour l'utilisation dans l'application
   */
  const normalizePlan = (plan: any) => {
    return {
      ...plan,
      price: parseFloat(String(plan.price)) || 0,
      features: parseFeatures(plan.features),
      duration: parseInt(String(plan.duration)) || 30
    }
  }

  /**
   * Récupérer tous les plans disponibles
   */
  const fetchPlans = async () => {
    plansLoading.value = true
    plansError.value = ''
    
    try {
      const response = await fetch(`${config.public.apiSubcriptionUrl}plans`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // L'API retourne { data: [...], meta: {...} }
      const plans = data.data || data
      
      // Normaliser les plans (parser les features JSON, convertir les prix, etc.)
      subscriptionPlans.value = Array.isArray(plans) 
        ? plans.map(normalizePlan)
        : []
      
      return subscriptionPlans.value
    } catch (error) {
      plansError.value = 'Erreur lors du chargement des plans'
      console.error('Erreur fetchPlans:', error)
      return []
    } finally {
      plansLoading.value = false
    }
  }

  /**
   * Récupérer un plan spécifique
   */
  const fetchPlan = async (planId: string | number) => {
    try {
      const response = await fetch(`${config.public.apiSubcriptionUrl}plans/${planId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const plan = data.data || data
      
      // Normaliser le plan
      return normalizePlan(plan)
    } catch (error) {
      console.error('Erreur fetchPlan:', error)
      return null
    }
  }

  /**
   * Créer un nouvel abonnement
   */
  const createSubscription = async (subscriptionData: any) => {

    // return console.log(subscriptionData)
    isProcessing.value = true
    errorMessage.value = ''
    processingStep.value = 'payment'
    
    try {
      const formData = new FormData()
      
      // Ajouter les données du formulaire
      if (subscriptionForm.value.userId) {
        formData.append('userId', subscriptionForm.value.userId)
      }
      formData.append('email', subscriptionForm.value.email)
      formData.append('firstName', subscriptionForm.value.firstName)
      formData.append('lastName', subscriptionForm.value.lastName)
      formData.append('company', subscriptionForm.value.company || '')
      formData.append('phone', subscriptionForm.value.phone || '')
      formData.append('planId', String(subscriptionForm.value.planId))
      formData.append('newsletter', String(subscriptionForm.value.newsletter))
      
      // ✅ Utiliser le transactionId passé en paramètre ou depuis subscriptionData
      const txId = subscriptionData?.transactionId || subscriptionForm.value.transactionId || ''
      formData.append('transactionId', txId)
      console.log('📤 TransactionID envoyé à l\'API:', txId)
      
      
      // Ajouter le justificatif étudiant si applicable
      if (subscriptionForm.value.studentProof) {
        formData.append('studentProof', subscriptionForm.value.studentProof)
      }
      
      const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur createSubscription:', errorData?.error)
        throw new Error(errorData.error || `Une erreur est survenue, réessayez!`)
      }
      
      const data = await response.json()
      
      processingStep.value = 'confirmation'
      currentSubscription.value = data.data || data
      
      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Erreur lors de la création de l\'abonnement'
      console.error('Erreur createSubscription:', error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Récupérer l'abonnement actuel de l'utilisateur
   */
  const fetchCurrentSubscription = async (userId?: string) => {
    subscriptionLoading.value = true
    subscriptionError.value = ''
    
    try {
      const url = userId 
        ? `${config.public.apiSubcriptionUrl}subscriptions/user/${userId}`
        : `${config.public.apiSubcriptionUrl}subscriptions/current`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          // Pas d'abonnement trouvé
          currentSubscription.value = null
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      currentSubscription.value = data.data || data
      
      return currentSubscription.value
    } catch (error) {
      subscriptionError.value = 'Erreur lors du chargement de votre abonnement'
      console.error('Erreur fetchCurrentSubscription:', error)
      currentSubscription.value = null
      return null
    } finally {
      subscriptionLoading.value = false
    }
  }

  /**
   * Renouveler un abonnement
   */
  const renewSubscription = async (subscriptionId: string, paymentData?: any) => {
    isProcessing.value = true
    errorMessage.value = ''
    
    try {
      const payload = {
        ...paymentData
      }
      
      const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      currentSubscription.value = data.data || data
      
      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Erreur lors du renouvellement de l\'abonnement'
      console.error('Erreur renewSubscription:', error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Annuler un abonnement
   */
  const cancelSubscriptionAPI = async (subscriptionId: string) => {
    isProcessing.value = true
    errorMessage.value = ''
    
    try {
      const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      currentSubscription.value = data.data || data
      
      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Erreur lors de l\'annulation de l\'abonnement'
      console.error('Erreur cancelSubscriptionAPI:', error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Mettre à jour un abonnement
   */
  const updateSubscription = async (subscriptionId: string, updateData: any) => {
    isProcessing.value = true
    errorMessage.value = ''
    
    try {
      const response = await fetch(`${config.public.apiSubcriptionUrl}subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      currentSubscription.value = data.data || data
      
      return true
    } catch (error: any) {
      errorMessage.value = error.message || 'Erreur lors de la mise à jour de l\'abonnement'
      console.error('Erreur updateSubscription:', error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  // Méthodes utilitaires
  const selectPlan = (planId: string | number) => {
    subscriptionForm.value.planId = String(planId)
    const plan = subscriptionPlans.value.find(p => p.id === planId)
    console.log('Plan sélectionné:', plan?.name)
  }

  const getSelectedPlan = computed(() => {
    if (!subscriptionForm.value.planId) return null
    return subscriptionPlans.value.find(p => String(p.id) === subscriptionForm.value.planId)
  })

  const validateForm = (): boolean => {
    errorMessage.value = ''
    
    if (!subscriptionForm.value.planId) {
      errorMessage.value = 'Veuillez sélectionner un plan d\'abonnement'
      return false
    }
    
    if (!subscriptionForm.value.email || !subscriptionForm.value.email.includes('@')) {
      errorMessage.value = 'Veuillez entrer une adresse email valide'
      return false
    }
    
    if (!subscriptionForm.value.firstName || !subscriptionForm.value.lastName) {
      errorMessage.value = 'Veuillez renseigner votre nom complet'
      return false
    }
    
    if (!subscriptionForm.value.acceptTerms) {
      errorMessage.value = 'Veuillez accepter les conditions générales'
      return false
    }
    
    return true
  }

  const processSubscription = async () => {
    if (!validateForm()) {
      return false
    }

    return await createSubscription(subscriptionForm.value)
  }

  const resetForm = () => {
    subscriptionForm.value = {
      userId: null,
      planId: null,
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      studentProof: null,
      acceptTerms: false,
      newsletter: true,
      transactionId: ''
    }
    processingStep.value = 'form'
    errorMessage.value = ''
  }

  const formatPrice = (price: number, currency: string = 'FCFA') => {
    if (price === 0) return 'Gratuit'
    
    if (currency === 'FCFA') {
      // Format FCFA : 2 000 FCFA, 20 000 FCFA
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const cancelSubscription = async () => {
    if (!currentSubscription.value?.id) {
      errorMessage.value = 'Aucun abonnement actif trouvé'
      return false
    }

    return await cancelSubscriptionAPI(currentSubscription.value.id)
  }

  return {
    // Data
    subscriptionPlans,
    currentSubscription,
    subscriptionForm,
    testimonials,
    faqs,
    stats,
    existingUserData,
    
    // Loading & Error states
    plansLoading,
    plansError,
    subscriptionLoading,
    subscriptionError,
    emailCheckLoading,
    emailCheckError,
    
    // States
    isProcessing,
    processingStep,
    errorMessage,
    userExists,
    
    // Computed
    getSelectedPlan,
    
    // Methods - Utilities
    selectPlan,
    validateForm,
    resetForm,
    formatPrice,
    
    // Methods - API
    fetchPlans,
    fetchPlan,
    fetchCurrentSubscription,
    createSubscription,
    processSubscription,
    renewSubscription,
    cancelSubscriptionAPI,
    updateSubscription,
    cancelSubscription,
    checkEmail,
    registerUser
  }
}
