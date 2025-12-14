export const useSubscription = () => {
  // Plans d'abonnement selon le cahier des charges
  const subscriptionPlans = ref([
    {
      id: 1,
      name: 'Gratuit',
      nameKey: 'subscription.plans.free.name',
      price: 0,
      currency: 'FCFA',
      period: 'free',
      periodKey: 'subscription.period.free',
      features: [
        'subscription.plans.free.feature1',
        'subscription.plans.free.feature2'
      ],
      rawFeatures: [
        'Inscription à la newsletter d\'actualités/promotions',
        'Sans accès au contenu premium'
      ],
      color: 'gray',
      popular: false,
      icon: '📧',
      validation: 'Aucune'
    },
    {
      id: 2,
      name: 'Premium - Mensuel',
      nameKey: 'subscription.plans.monthly.name',
      price: 2000,
      currency: 'FCFA',
      period: 'month',
      periodKey: 'subscription.period.month',
      features: [
        'subscription.plans.monthly.feature1',
        'subscription.plans.monthly.feature2'
      ],
      rawFeatures: [
        'Accès à l\'édition du mois en cours',
        'Envoi du PDF par e-mail'
      ],
      color: 'blue',
      popular: false,
      icon: '📰',
      validation: 'Aucune'
    },
    {
      id: 3,
      name: 'Premium - Achat à l\'Unité',
      nameKey: 'subscription.plans.single.name',
      price: 2000,
      currency: 'FCFA',
      period: 'once',
      periodKey: 'subscription.period.once',
      features: [
        'subscription.plans.single.feature1',
        'subscription.plans.single.feature2'
      ],
      rawFeatures: [
        'Achat et accès à une édition spécifique',
        'Envoi du PDF par e-mail'
      ],
      color: 'green',
      popular: false,
      icon: '📄',
      validation: 'Aucune'
    },
    {
      id: 4,
      name: 'Premium - Annuel',
      nameKey: 'subscription.plans.annual.name',
      price: 20000,
      currency: 'FCFA',
      period: 'year',
      periodKey: 'subscription.period.year',
      features: [
        'subscription.plans.annual.feature1',
        'subscription.plans.annual.feature2'
      ],
      rawFeatures: [
        'Accès aux 12 éditions de l\'année',
        'Envoi automatique du PDF par e-mail chaque mois'
      ],
      color: 'purple',
      popular: true,
      icon: '⭐',
      validation: 'Aucune'
    },
    {
      id: 5,
      name: 'Premium - Étudiant',
      nameKey: 'subscription.plans.student.name',
      price: 10000,
      currency: 'FCFA',
      period: 'year',
      periodKey: 'subscription.period.year',
      features: [
        'subscription.plans.student.feature1',
        'subscription.plans.student.feature2',
        'subscription.plans.student.feature3'
      ],
      rawFeatures: [
        'Accès aux 12 éditions de l\'année au tarif réduit',
        'Envoi automatique du PDF par e-mail chaque mois',
      ],
      color: 'orange',
      popular: false,
      icon: '🎓',
      validation: 'Preuve de statut étudiant (Carte, Certificat de scolarité)',
      requiresProof: true
    }
  ])

  // État de l'abonnement actuel (fake data - SIMULATION ACTIVE)
  const currentSubscription = ref({
    isActive: true,
    plan: subscriptionPlans.value[3], // Premium Annuel
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-12-01'),
    autoRenew: true
  })

  // État du formulaire
  const subscriptionForm = ref({
    planId: null as number | null,
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    studentProof: null as File | null, // Justificatif étudiant
    acceptTerms: false,
    newsletter: true
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

  // Méthodes
  const selectPlan = (planId: number) => {
    subscriptionForm.value.planId = planId
    const plan = subscriptionPlans.value.find(p => p.id === planId)
    console.log('Plan sélectionné:', plan?.name)
  }

  const getSelectedPlan = computed(() => {
    if (!subscriptionForm.value.planId) return null
    return subscriptionPlans.value.find(p => p.id === subscriptionForm.value.planId)
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

    isProcessing.value = true
    processingStep.value = 'payment'

    try {
      // Simulation de traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      processingStep.value = 'confirmation'
      
      // Mise à jour de l'abonnement (fake)
      const plan = getSelectedPlan.value
      if (plan) {
        currentSubscription.value = {
          isActive: true,
          plan: plan,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
          autoRenew: true
        }
      }

      return true
    } catch (error) {
      errorMessage.value = 'Une erreur est survenue lors du traitement de votre paiement'
      console.error('Erreur:', error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  const resetForm = () => {
    subscriptionForm.value = {
      planId: null,
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      studentProof: null,
      acceptTerms: false,
      newsletter: true
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
    isProcessing.value = true
    try {
      // Simulation d'annulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      currentSubscription.value.isActive = false
      currentSubscription.value.autoRenew = false
      return true
    } catch (error) {
      errorMessage.value = 'Erreur lors de l\'annulation'
      return false
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // Data
    subscriptionPlans,
    currentSubscription,
    subscriptionForm,
    testimonials,
    faqs,
    stats,
    
    // States
    isProcessing,
    processingStep,
    errorMessage,
    
    // Computed
    getSelectedPlan,
    
    // Methods
    selectPlan,
    validateForm,
    processSubscription,
    resetForm,
    formatPrice,
    cancelSubscription
  }
}
