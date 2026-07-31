/**
 * Composant d'inscription avec vérification d'email en premier
 * 
 * Flux:
 * 1. Demander email
 * 2. Vérifier si existe (checkEmail)
 * 3. Si existe → pré-remplir reste du formulaire
 * 4. Si n'existe pas → afficher form d'enregistrement
 * 5. Sélectionner plan et créer abonnement
 */

<template>
  <div class="subscription-email-wrapper">
    <!-- ========== ÉTAPE 1: VÉRIFICATION EMAIL ========== -->
    <section v-if="currentStep === 'email-check'" class="step email-check-step">
      <div class="step-header">
        <h2>Commençons par votre email</h2>
        <p>Nous vérifierons si vous êtes déjà inscrit</p>
      </div>

      <form @submit.prevent="handleEmailVerification" class="email-form">
        <div class="form-group">
          <label for="email">Votre email *</label>
          <input
            id="email"
            v-model="emailInput"
            type="email"
            required
            placeholder="exemple@email.com"
            :disabled="emailCheckLoading"
            class="form-control"
          />
          <small class="form-text">Nous vérifierons si vous existez déjà</small>
        </div>

        <button
          type="submit"
          :disabled="emailCheckLoading || !emailInput"
          class="btn btn-primary btn-lg"
        >
          <span v-if="emailCheckLoading" class="spinner-icon">⟳</span>
          <span v-else>Continuer</span>
        </button>

        <!-- Affichage des erreurs -->
        <div v-if="emailCheckError" class="alert alert-error mt-3">
          {{ emailCheckError }}
        </div>
      </form>

      <!-- Info supplémentaire -->
      <div class="info-box">
        <p>ℹ️ Nous vérifierons votre email dans notre base de données</p>
      </div>
    </section>

    <!-- ========== ÉTAPE 2A: UTILISATEUR EXISTANT ========== -->
    <section v-if="currentStep === 'existing-user' && userExists" class="step existing-user-step">
      <div class="step-header">
        <h2>Bienvenue de retour!</h2>
        <p>Nous avons retrouvé votre profil</p>
      </div>

      <!-- Afficher les données retrouvées -->
      <div class="user-info-card">
        <div class="info-item">
          <label>Email</label>
          <p class="value">{{ subscriptionForm.email }}</p>
        </div>

        <div class="form-row">
          <div class="info-item">
            <label>Prénom</label>
            <p class="value">{{ subscriptionForm.firstName }}</p>
          </div>
          <div class="info-item">
            <label>Nom</label>
            <p class="value">{{ subscriptionForm.lastName }}</p>
          </div>
        </div>

        <div class="info-item">
          <label>Téléphone</label>
          <p class="value">{{ subscriptionForm.phone }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="button-group">
        <button @click="proceedToPlans" class="btn btn-primary btn-lg">
          C'est correct, continuer
        </button>
        <button @click="editProfile" class="btn btn-secondary">
          Modifier vous informations
        </button>
      </div>
    </section>

    <!-- ========== ÉTAPE 2B: NOUVEL UTILISATEUR ========== -->
    <section v-if="currentStep === 'new-user'" class="step new-user-step">
      <div class="step-header">
        <h2>Créer votre compte</h2>
        <p>Complétez vos informations pour continuer</p>
      </div>

      <form @submit.prevent="handleRegistration" class="registration-form">
        <!-- Email -->
        <div class="form-group">
          <label for="email-display">Email *</label>
          <input
            id="email-display"
            v-model="subscriptionForm.email"
            type="email"
            required
            placeholder="exemple@email.com"
            :disabled="isProcessing"
            class="form-control"
            :class="{ 'input-warning': emailExistsWarning }"
          />
          <div v-if="checkingEmail" class="email-checking">
            <span class="spinner-icon">⟳</span> Vérification...
          </div>
          <div v-if="emailExistsWarning" class="alert alert-warning mt-2">
            <strong>Vous avez déjà un compte !</strong><br>
            Veuillez vous connecter avec cet email.
            <button type="button" @click="goToLogin" class="btn-link-warning">Connectez-vous ici</button>
          </div>
        </div>

        <!-- Mot de passe -->
        <div class="form-group">
          <label for="password">Mot de passe *</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="Minimum 8 caractères"
            :disabled="isProcessing"
            class="form-control"
          />
          <small class="form-text">
            Choisissez un mot de passe sécurisé (min 8 caractères)
          </small>
        </div>

        <!-- Prénom et Nom -->
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom *</label>
            <input
              id="firstName"
              v-model="subscriptionForm.firstName"
              type="text"
              required
              placeholder="John"
              :disabled="isProcessing"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom *</label>
            <input
              id="lastName"
              v-model="subscriptionForm.lastName"
              type="text"
              required
              placeholder="Doe"
              :disabled="isProcessing"
              class="form-control"
            />
          </div>
        </div>

        <!-- Téléphone -->
        <div class="form-group">
          <label for="phone">Téléphone *</label>
          <input
            id="phone"
            v-model="subscriptionForm.phone"
            type="tel"
            required
            placeholder="+33612345678"
            :disabled="isProcessing"
            class="form-control"
          />
        </div>

        <!-- Bouton soumettre -->
        <button
          type="submit"
          :disabled="isProcessing"
          class="btn btn-primary btn-lg"
        >
          <span v-if="isProcessing" class="spinner-icon">⟳</span>
          <span v-else>Créer mon compte</span>
        </button>

        <!-- Affichage des erreurs -->
        <div v-if="errorMessage" class="alert alert-error mt-3">
          {{ errorMessage }}
        </div>

        <!-- Lien vers connexion -->
        <div class="login-link-wrapper">
          <p class="login-text">Déjà inscrit ?
            <button type="button" @click="goToLogin" class="btn-link">Connectez-vous</button>
          </p>
        </div>
      </form>
    </section>

    <!-- ========== ÉTAPE 3: MODIFICATION PROFIL ========== -->
    <section v-if="currentStep === 'edit-profile'" class="step edit-profile-step">
      <div class="step-header">
        <h2>Modifier vos informations</h2>
      </div>

      <form @submit.prevent="handleEditProfile" class="edit-form">
        <!-- Prénom -->
        <div class="form-group">
          <label for="edit-firstName">Prénom *</label>
          <input
            id="edit-firstName"
            v-model="subscriptionForm.firstName"
            type="text"
            required
            :disabled="isProcessing"
            class="form-control"
          />
        </div>

        <!-- Nom -->
        <div class="form-group">
          <label for="edit-lastName">Nom *</label>
          <input
            id="edit-lastName"
            v-model="subscriptionForm.lastName"
            type="text"
            required
            :disabled="isProcessing"
            class="form-control"
          />
        </div>

        <!-- Téléphone -->
        <div class="form-group">
          <label for="edit-phone">Téléphone *</label>
          <input
            id="edit-phone"
            v-model="subscriptionForm.phone"
            type="tel"
            required
            :disabled="isProcessing"
            class="form-control"
          />
        </div>

        <!-- Boutons -->
        <div class="button-group">
          <button
            type="submit"
            :disabled="isProcessing"
            class="btn btn-primary btn-lg"
          >
            <span v-if="isProcessing">Enregistrement...</span>
            <span v-else>Enregistrer les modifications</span>
          </button>
          <button
            type="button"
            @click="cancelEdit"
            class="btn btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </section>

    <!-- ========== ÉTAPE 4: FINALISATION ========== -->
    <section v-if="shouldShowRecap" class="step finalization-step">
      <div class="step-header">
        <h2>Récapitulatif de votre abonnement</h2>
        <p>Vérifiez les détails avant de finaliser</p>
      
      </div>

      <!-- Afficher le détail du plan sélectionné -->
      <div v-if="selectedPlanDetails || getSelectedPlan" class="selected-plan-summary">
        <div class="plan-card-summary">
          <div class="plan-header">
            <h3>{{ (selectedPlanDetails || getSelectedPlan)?.name }}</h3>
            <span v-if="selectedPlanDetails?.id !== freePlan" class="plan-price">
              {{ formatPrice((selectedPlanDetails || getSelectedPlan)?.price || 0) }}/an
            </span>
            
            <span v-else style="color: var(--cs-brown-color); font: bold;" class="plan-price">
              Accès limité à l’intégralité des revues
            </span>
          </div>
          
          <!-- <p class="plan-description">{{ (selectedPlanDetails || getSelectedPlan).description }}</p> -->
          
          <div class="plan-details-summary">
            
            
            <div class="detail">
              <span class="label">Nom :</span>
              <span class="value">{{ subscriptionForm.firstName }} {{ subscriptionForm.lastName }}</span>
            </div>
            <div v-if="subscriptionForm.userId" class="detail">
              <span class="label">Téléphone :</span>
              <span class="value"> {{ subscriptionForm.phone }} </span>
            </div>
            <div class="detail">
              <span class="label">Email :</span>
              <!-- existingUserData -->
              <span class="value">{{ subscriptionForm.email }}  </span>
            </div>
            <div v-if="(selectedPlanDetails || getSelectedPlan)?.period > 0" class="detail">
              <span class="label">Durée :</span>
              <span class="value">{{ (selectedPlanDetails || getSelectedPlan)?.duration }} jours</span>
            </div>
            
          </div>

          <div style="margin-block: 1rem;" class="features-summary">
            <h4>Avantages : </h4>
            <ul style="" >
              <li  v-for="(feature, i) in (selectedPlanDetails || getSelectedPlan)?.features || []" :key="i">
                 {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Choix du moyen de paiement pour les abonnements payants -->
      <div v-if="isPaidJekoPlan" class="payment-methods-section">
        <div class="selection-header">
          <h3><Icon icon="mdi:credit-card-outline" width="24" height="24" /> Moyen de paiement</h3>
          <p class="selection-subtitle">Sélectionnez le moyen que vous souhaitez utiliser</p>
          <span class="required-badge">Obligatoire</span>
        </div>

        <div v-if="jekoMethodsLoading" class="payment-methods-loading">
          Chargement des moyens de paiement...
        </div>

        <div v-else-if="jekoMethodsError" class="alert alert-error">
          {{ jekoMethodsError }}
          <button type="button" class="btn btn-secondary mt-3" @click="loadJekoPaymentMethods">
            Réessayer
          </button>
        </div>

        <div v-else class="payment-methods-grid">
          <label
            v-for="method in jekoPaymentMethods"
            :key="getJekoPaymentMethodValue(method)"
            class="payment-method-card"
            :class="{ selected: esjekoPaymentMethod === getJekoPaymentMethodValue(method) }"
          >
            <input
              v-model="esjekoPaymentMethod"
              type="radio"
              name="jeko-payment-method"
              :value="getJekoPaymentMethodValue(method)"
              :disabled="!getJekoPaymentMethodValue(method) || isProcessing || isPaying"
            />
            <span class="method-logo">
              <img
                v-if="method.logo"
                :src="getJekoPaymentMethodLogo(method.logo)"
                :alt="method.name || method.code || 'Moyen de paiement'"
              />
              <Icon v-else icon="mdi:wallet-outline" width="26" height="26" />
            </span>
            <span class="method-name">{{ method.name || method.code || method.id }}</span>
          </label>
        </div>

        <div
          v-if="!jekoMethodsLoading && !jekoMethodsError && !jekoPaymentMethods.length"
          class="alert alert-warning mt-3"
        >
          Aucun moyen de paiement n'est disponible pour le moment.
        </div>
      </div>

      <!-- Affichage des erreurs -->
      <div v-if="errorMessage" class="alert alert-error mt-3">
        {{ errorMessage }}
      </div>

      <!-- Section pour achat à l'unité (fonctionnalité future) -->
      <!-- Les achats à l'unité sont gérés séparément sur la page des éditions -->

      <!-- Justificatif étudiant -->
      <div v-if="isStudentPlan" class="student-proof-section">
        <div class="selection-header">
          <h3><Icon icon="mdi:school" width="24" height="24" /> Justificatif étudiant</h3>
          <p class="selection-subtitle">Prière d'uploader votre carte d'étudiant IUA, votre carte de membre AUPROHADA-UCAO de l'année en cours, ou tout autre justificatif de scolarité</p>
          <span class="required-badge">Obligatoire</span>
        </div>

        <div class="upload-zone" :class="{ 'has-file': studentProofFile }">
          <input
            type="file"
            id="studentProof"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleStudentProofUpload"
            class="file-input"
          />
          <label for="studentProof" class="upload-label">
            <Icon v-if="!studentProofFile" icon="mdi:cloud-upload" width="48" height="48" />
            <Icon v-else icon="mdi:check-circle" width="48" height="48" class="success-icon" />
            <span v-if="!studentProofFile">Cliquez pour télécharger votre justificatif</span>
            <span v-else class="file-name">{{ studentProofName }}</span>
            <small>PDF, JPG ou PNG (max 5 Mo)</small>
          </label>
        </div>

        <div v-if="isStudentPlan && !studentProofFile" class="alert alert-warning mt-3">
          ⚠️ Veuillez télécharger un justificatif étudiant pour continuer
        </div>
      </div>

      <!-- Bouton de finalisation -->
      <div class="button-group mt-4">
        <button
          @click="handleCreateSubscription"
          :disabled="isProcessing || isPaying || (isStudentPlan && !studentProofFile) || (isPaidJekoPlan && !esjekoPaymentMethod)"
          class="btn btn-primary btn-lg"
        >
          <span v-if="isProcessing">Création de l'abonnement...</span>
          <span v-else-if="isPaying">Redirection vers le paiement...</span>
          <span v-else>Finaliser mon abonnement</span>
        </button>
      </div>
    </section>

    <!-- ========== ÉTAPE 5: CONFIRMATION ========== -->
    <section v-if="currentStep === 'confirmation'" class="step confirmation-step">
      <!-- Message pour plans étudiants (en attente de validation) -->
      <div v-if="isStudentPlan" class="pending-validation-box">
        <div class="pending-icon">
          <Icon icon="mdi:clock-check-outline" width="64" height="64" />
        </div>
        <h2>Inscription enregistrée !</h2>
        <p class="pending-message">
          Votre demande d'abonnement <strong>{{ (selectedPlanDetails || getSelectedPlan)?.name }}</strong> a bien été prise en compte.
        </p>
        <div class="validation-info-card">
          <div class="validation-info-icon">
            <Icon icon="mdi:information-outline" width="24" height="24" />
          </div>
          <div class="validation-info-content">
            <h4>Inscription en cours de validation</h4>
            <p>Votre carte étudiante est en cours de vérification par notre équipe. Vous recevrez un email de confirmation dès que votre abonnement sera activé.</p>
            <p class="validation-delay">Délai de traitement : <strong>24 à 48 heures ouvrées</strong></p>
          </div>
        </div>
      </div>

      <!-- Message pour plans classiques (actifs immédiatement) -->
      <div v-else class="success-box">
        <div class="success-icon">✓</div>
        <h2>Abonnement créé avec succès!</h2>
        <p>Votre abonnement est maintenant actif</p>
      </div>

      <div class="confirmation-details">
        <div class="detail-item">
          <label>Utilisateur</label>
          <p>{{ subscriptionForm.firstName }} {{ subscriptionForm.lastName }}</p>
        </div>

        <div class="detail-item">
          <label>Email</label>
          <p>{{ subscriptionForm.email }}</p>
        </div>

        <div class="detail-item">
          <label>Plan</label>
          <p>{{ (selectedPlanDetails || getSelectedPlan)?.name }}</p>
        </div>

        <div v-if="isStudentPlan" class="detail-item">
          <label>Statut</label>
          <p class="status-pending">En attente de validation</p>
        </div>
      </div>

      <p class="confirmation-message">
        Un email de confirmation a été envoyé à <strong>{{ subscriptionForm.email }}</strong>
      </p>

      <button @click="handleFinish" class="btn btn-primary btn-lg">
        {{ isStudentPlan ? 'Retour à l\'accueil' : 'Accéder à mon compte →' }}
      </button>

    </section>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscription } from '~/composables/useSubscription'
import { useAuth } from '~/composables/useAuth'
import {
  JEKO_CHECKOUT_DETAILS_KEY,
  JEKO_CHECKOUT_REFERENCE_KEY,
  JEKO_PENDING_SUBSCRIPTION_KEY,
  type JekoPaymentMethod,
  useJekoCheckout
} from '~/composables/useJekoCheckout'
import {Icon} from "@iconify/vue"

const router = useRouter()
const config = useRuntimeConfig()
const CS_JEKO_PROD = Number(config.public.CS_JEKO_PROD ?? 1)
const { isLoggedIn, getAuthUser } = useAuth()
const {
  createCheckout: createJekoCheckout,
  error: jekoCheckoutError,
  getMethods: getJekoPaymentMethods,
  logoUrl: getJekoPaymentMethodLogo
} = useJekoCheckout()
const isPaying = ref(false)
const jekoMethodsLoading = ref(false)
const jekoMethodsError = ref('')
const jekoPaymentMethods = ref<JekoPaymentMethod[]>([])
const esjekoPaymentMethod = ref('')

// Emits pour communiquer avec le parent
const emit = defineEmits<{
  (e: 'open-login-modal'): void
}>()
// IDs des plans (correspondent aux types du backend)
const freePlan = ref("free")
const annualPlan = ref("annual")
const studentPlan = ref("student")

// Justificatif étudiant
const studentProofFile = ref<File | null>(null)
const studentProofName = ref('')

const handleStudentProofUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    studentProofFile.value = target.files[0]
    studentProofName.value = target.files[0].name
    subscriptionForm.value.studentProof = target.files[0]
  }
}

const isStudentPlan = computed(() => {
  const plan = selectedPlanDetails.value || getSelectedPlan.value
  if (!plan) return false
  return plan.id === studentPlan.value ||
         plan.type === 'student' ||
         plan.type === 'student_iua' ||
         plan.id === 'student_iua' ||
         plan.requiresProof === true ||
         (plan.name && plan.name.toLowerCase().includes('étudiant')) ||
         (plan.name && plan.name.toLowerCase().includes('etudiant')) ||
         (plan.name && plan.name.toLowerCase().includes('student'))
})

const transactionId = `TXN_altnews_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Note: Les achats à l'unité sont gérés séparément via la page des éditions

const {
  // Méthodes
  checkEmail,
  registerUser,
  selectPlan,
  createSubscription,
  fetchPlans,
  formatPrice,

  // États Email Check
  emailCheckLoading,
  emailCheckError,
  userExists,
  existingUserData,

  // États Enregistrement
  isProcessing,
  errorMessage,
  subscriptionForm,

  // États Plans
  subscriptionPlans,
  plansLoading,
  plansError,
  getSelectedPlan
} = useSubscription()

// États locaux
const currentStep = ref<'email-check' | 'existing-user' | 'new-user' | 'edit-profile' | 'select-plan' | 'confirmation'>('email-check')
const emailInput = ref('')
const password = ref('')
const originalUserData = ref<any>(null)
const selectedPlanBeforeAuth = ref<string | null>(null)
const selectedPlanDetails = ref<any>(null)

// Debug: surveiller si le recap devrait s'afficher
const shouldShowRecap = computed(() => {
  const result = currentStep.value === 'select-plan' && !!subscriptionForm.value.planId && !!subscriptionForm.value.userId

  return result
})

const selectedPlanPrice = computed(() => {
  return Number(selectedPlanDetails.value?.price ?? getSelectedPlan.value?.price ?? 0)
})

const jekoBusiness = computed(() => {
  return String(config.public.CS_JEKO_BUSINESS || '')
})

const jekoReturnUrl = computed(() => {
  return String(config.public.CS_JEKO_RETURN_URL || '')
})

const isPaidJekoPlan = computed(() => {
  return shouldShowRecap.value && subscriptionForm.value.planId !== freePlan.value && selectedPlanPrice.value > 0
})

const getJekoPaymentMethodValue = (method: JekoPaymentMethod) => {
  return String(method.code || method.id || '')
}

const loadJekoPaymentMethods = async () => {
  if (jekoMethodsLoading.value) return

  jekoMethodsLoading.value = true
  jekoMethodsError.value = ''

  try {
    jekoPaymentMethods.value = await getJekoPaymentMethods()

    const selectedMethodStillExists = jekoPaymentMethods.value.some(
      method => getJekoPaymentMethodValue(method) === esjekoPaymentMethod.value
    )
    if (!selectedMethodStillExists) {
      esjekoPaymentMethod.value = ''
    }
  } catch (error: any) {
    jekoPaymentMethods.value = []
    esjekoPaymentMethod.value = ''
    jekoMethodsError.value = error?.message || 'Impossible de charger les moyens de paiement'
  } finally {
    jekoMethodsLoading.value = false
  }
}

watch(isPaidJekoPlan, (isPaidPlan) => {
  if (isPaidPlan && !jekoPaymentMethods.value.length) {
    loadJekoPaymentMethods()
  }
}, { immediate: true })

// Vérification email en temps réel
const emailExistsWarning = ref(false)
const checkingEmail = ref(false)
let emailCheckTimeout: any = null

// Vérifier l'email en temps réel quand l'utilisateur le saisit
// Seulement si on est à l'étape new-user (création de compte)
watch(() => subscriptionForm.value.email, (newEmail) => {
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout)
  }

  emailExistsWarning.value = false

  // Ne pas vérifier l'email si on est déjà à l'étape de sélection de plan (utilisateur connecté)
  // ou si l'utilisateur est déjà identifié
  if (currentStep.value === 'select-plan' || subscriptionForm.value.userId) {
    return
  }

  if (newEmail && newEmail.includes('@') && newEmail.includes('.')) {
    emailCheckTimeout = setTimeout(async () => {
      checkingEmail.value = true
      try {
        const result = await checkEmail(newEmail)
        if (result.exists) {
          emailExistsWarning.value = true
        }
      } catch (e) {
        console.error('Erreur lors de la vérification email:', e)
      } finally {
        checkingEmail.value = false
      }
    }, 500)
  }
})

// Charger les plans au montage
onMounted(() => {
  console.log('🔵 SubscriptionFormEmail mounted')
  console.log('🔵 Initial state:', {
    planId: subscriptionForm.value.planId,
    userId: subscriptionForm.value.userId,
    currentStep: currentStep.value
  })

  fetchPlans()

  // Restaurer le plan depuis localStorage s'il existe
  const savedPlan = localStorage.getItem('selectedPlan')
  if (savedPlan) {
    try {
      const parsedPlan = JSON.parse(savedPlan)
      selectedPlanDetails.value = parsedPlan
      if (parsedPlan.id) {
        // Ne pas écraser le planId s'il est déjà défini (par PricingCard)
        if (!subscriptionForm.value.planId) {
          subscriptionForm.value.planId = parsedPlan.id
          console.log('🔵 planId restored from localStorage:', parsedPlan.id)
        }
        selectedPlanBeforeAuth.value = parsedPlan.id
      }
    } catch (e) {
      console.error('Erreur lors de la restauration du plan:', e)
    }
  }

  // Si l'utilisateur est déjà connecté, pré-remplir les données et aller à la sélection du plan
  console.log('🔵 isLoggedIn:', isLoggedIn())
  if (isLoggedIn()) {
    const user = getAuthUser()
    console.log('🔵 authUser:', user)
    if (user) {
      subscriptionForm.value.email = user.email || ''
      subscriptionForm.value.firstName = user.firstName || ''
      subscriptionForm.value.lastName = user.lastName || ''
      subscriptionForm.value.phone = user.phone || ''

      // S'assurer que userId est défini - utiliser l'id ou générer un identifiant temporaire basé sur l'email
      const userId = user.id || user.userId || user.subscriber_id
      console.log('🔵 userId from user:', userId)
      if (userId) {
        subscriptionForm.value.userId = String(userId)
      } else if (user.email) {
        // Fallback: utiliser l'email comme identifiant temporaire si pas d'id
        subscriptionForm.value.userId = `email:${user.email}`
        console.warn('User ID manquant, utilisation de l\'email comme identifiant temporaire')
      }

      console.log('🔵 Final state before setting step:', {
        planId: subscriptionForm.value.planId,
        userId: subscriptionForm.value.userId
      })

      // Aller directement à l'étape de sélection de plan si userId est défini
      if (subscriptionForm.value.userId) {
        currentStep.value = 'select-plan'
        console.log('🔵 Set currentStep to select-plan')
        return
      }
    }
  }

  // Sinon, aller au formulaire de création de compte
  currentStep.value = 'new-user'
  console.log('🔵 Set currentStep to new-user')
})

// Restaurer le plan sélectionné après chargement des plans
// Seulement si aucun plan n'est déjà sélectionné
watch(subscriptionPlans, (newPlans) => {
  console.log('🟡 subscriptionPlans watch triggered, plans count:', newPlans.length)
  if (newPlans.length > 0 && selectedPlanBeforeAuth.value && !subscriptionForm.value.planId) {
    subscriptionForm.value.planId = selectedPlanBeforeAuth.value
    console.log('🟡 planId set from selectedPlanBeforeAuth:', selectedPlanBeforeAuth.value)
  }
})

// Debug: surveiller les changements de userId et planId
watch(() => subscriptionForm.value.userId, (newVal, oldVal) => {
  console.log('🔴 userId changed:', oldVal, '->', newVal)
  console.trace('userId change stack trace')
})

watch(() => subscriptionForm.value.planId, (newVal, oldVal) => {
  console.log('🟢 planId changed:', oldVal, '->', newVal)
})

watch(currentStep, (newVal, oldVal) => {
  console.log('🟣 currentStep changed:', oldVal, '->', newVal)
})

// Mettre à jour selectedPlanDetails quand subscriptionForm.planId change
watch(() => subscriptionForm.value.planId, (newPlanId) => {
  if (newPlanId && subscriptionPlans.value.length > 0) {
    const plan = subscriptionPlans.value.find((p: any) => String(p.id) === String(newPlanId))
    if (plan) {
      selectedPlanDetails.value = plan
      // Sauvegarder le plan dans localStorage
      localStorage.setItem('selectedPlan', JSON.stringify(plan))
      console.log('Plan mis à jour:', plan.name)
    }
  }
})

/**
 * Étape 1: Vérification d'email
 */
const handleEmailVerification = async () => {
  const result = await checkEmail(emailInput.value)

  if (result.error) {
    // Erreur lors de la vérification
    return
  }

  if (result.exists) {
    // Utilisateur trouvé - sauvegarder les données dans localStorage
    localStorage.setItem('userVerification', JSON.stringify({
      userId: result.user.userId || result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      phone: result.user.phone
    }))
    currentStep.value = 'existing-user'
  } else {
    // Nouvel utilisateur - afficher formulaire d'enregistrement
    subscriptionForm.value.email = emailInput.value
    currentStep.value = 'new-user'
  }
}

/**
 * Étape 2A: Utilisateur existant - Continuer
 */
const proceedToPlans = () => {
  // Restaurer les données vérifiées depuis localStorage
  const userVerification = localStorage.getItem('userVerification')
  if (userVerification) {
    try {
      const userData = JSON.parse(userVerification)
      subscriptionForm.value.userId = userData.userId
      subscriptionForm.value.email = userData.email
      subscriptionForm.value.firstName = userData.firstName
      subscriptionForm.value.lastName = userData.lastName
      subscriptionForm.value.phone = userData.phone
    } catch (e) {
      console.error('Erreur lors de la restauration des données utilisateur:', e)
    }
  }
  
  originalUserData.value = { ...subscriptionForm.value }
  // Sauvegarder le plan s'il a été sélectionné avant
  if (subscriptionForm.value.planId) {
    selectedPlanBeforeAuth.value = subscriptionForm.value.planId
  }
  currentStep.value = 'select-plan'
  // Assurer que les plans sont chargés
  if (subscriptionPlans.value.length === 0) {
    fetchPlans()
  }
}

/**
 * Étape 2A: Utilisateur existant - Modifier
 */
const editProfile = () => {
  originalUserData.value = { ...subscriptionForm.value }
  currentStep.value = 'edit-profile'
}

/**
 * Étape 2B: Nouvel utilisateur - Enregistrement
 */
const handleRegistration = async () => {
  const result = await registerUser(
    subscriptionForm.value.email,
    password.value,
    subscriptionForm.value.firstName,
    subscriptionForm.value.lastName,
    subscriptionForm.value.phone
  )

  if (result.user) {
    // Compte créé avec succès - sauvegarder les données dans localStorage
    localStorage.setItem('userVerification', JSON.stringify({
      userId: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      phone: result.user.phone
    }))

    // Sauvegarder le token si nécessaire
    if (result.token) {
      localStorage.setItem('auth_token', result.token)
    }

    currentStep.value = 'select-plan'
    // Assurer que les plans sont chargés
    if (subscriptionPlans.value.length === 0) {
      fetchPlans()
    }
  } else if (result.emailExists) {
    // L'email existe déjà → rediriger vers le login
    const pathParts = window.location.pathname.split('/')
    const locale = ['fr', 'en'].includes(pathParts[1]) ? pathParts[1] : 'fr'
    // Sauvegarder l'email pour pré-remplir le formulaire de login
    localStorage.setItem('login_email', subscriptionForm.value.email)
    router.push(`/${locale}/subscriber/manage?login=true`)
  }
  // Les erreurs s'affichent dans errorMessage
}

/**
 * Ouvrir le modal de connexion
 */
const goToLogin = () => {
  emit('open-login-modal')
}

/**
 * Étape 2B: Retour à la vérification d'email
 */
const backToEmailCheck = () => {
  emailInput.value = ''
  password.value = ''
  subscriptionForm.value.firstName = ''
  subscriptionForm.value.lastName = ''
  subscriptionForm.value.phone = ''
  currentStep.value = 'email-check'
}

/**
 * Étape 3: Modification du profil
 */
const handleEditProfile = () => {
  // Les données sont déjà modifiées dans subscriptionForm
  currentStep.value = 'existing-user'
}

/**
 * Étape 3: Annuler la modification
 */
const cancelEdit = () => {
  // Restaurer les données originales
  if (originalUserData.value) {
    Object.assign(subscriptionForm.value, originalUserData.value)
  }
  currentStep.value = 'existing-user'
}

/**
 * Étape 4: Retour au profil
 */
const goBackToProfile = () => {
  if (userExists) {
    currentStep.value = 'existing-user'
  } else {
    currentStep.value = 'new-user'
  }
}

/**
 * Étape 4: Créer l'abonnement (callback après paiement)
 */
const completeSubscription = async () => {
  console.log('📝 Finalisation de l\'abonnement après paiement...')
  console.log('📝 Données du formulaire:', {
    userId: subscriptionForm.value.userId,
    planId: subscriptionForm.value.planId,
    email: subscriptionForm.value.email,
    transactionId: transactionId
  })

  const subscriptionData = {...subscriptionForm.value, transactionId, password: password.value}

  console.log('📝 Appel createSubscription avec:', subscriptionData)
  const success = await createSubscription(subscriptionData)

  if (success) {
    console.log('✅ Abonnement créé/mis à jour avec succès!')
    // Nettoyer le localStorage pour forcer un rafraîchissement des données
    localStorage.removeItem('selectedPlan')

    // Pour les plans étudiants (en attente de validation), montrer le message de confirmation
    const plan = selectedPlanDetails.value || getSelectedPlan.value
    if (plan && (plan.type === 'student' || plan.type === 'student_iua' || plan.id === 'student' || plan.id === 'student_iua')) {
      currentStep.value = 'confirmation'
      return
    }

    // Récupérer la locale courante
    const pathParts = window.location.pathname.split('/')
    const locale = ['fr', 'en'].includes(pathParts[1]) ? pathParts[1] : 'fr'

    // Rediriger vers l'espace abonné avec un petit délai pour que le backend mette à jour
    setTimeout(() => {
      router.push(`/${locale}/subscriber/manage`)
    }, 500)
  } else {
    console.error('❌ Erreur lors de la création/mise à jour de l\'abonnement')
    isPaying.value = false
  }
}

/**
 * Étape 4: Déclencher le paiement Jeko
 */
const getSerializableSubscriptionData = () => {
  const {
    studentProof,
    ...serializableSubscriptionForm
  } = subscriptionForm.value

  return {
    ...serializableSubscriptionForm,
    transactionId,
    password: password.value
  }
}

const getCurrentLocale = () => {
  const pathParts = window.location.pathname.split('/')
  return ['fr', 'en'].includes(pathParts[1]) ? pathParts[1] : 'fr'
}

const normalizeJekoUserId = (userId: string | null) => {
  if (!userId) return subscriptionForm.value.email
  const numericUserId = Number(userId)
  return Number.isFinite(numericUserId) && String(numericUserId) === String(userId)
    ? numericUserId
    : userId
}

const payWithJeko = async (amount: number) => {
  if (!subscriptionForm.value.userId || !subscriptionForm.value.email || !subscriptionForm.value.phone) {
    console.error('❌ Données d\'abonnement incomplètes')
    alert('Veuillez remplir tous les champs requis')
    return
  }

  if (!esjekoPaymentMethod.value) {
    errorMessage.value = 'Veuillez sélectionner un moyen de paiement'
    return
  }

  if (!jekoBusiness.value) {
    errorMessage.value = 'Configuration Jeko incomplète: CS_JEKO_BUSINESS est manquant'
    return
  }

  if (!jekoReturnUrl.value) {
    errorMessage.value = 'Configuration Jeko incomplète: CS_JEKO_RETURN_URL est manquant'
    return
  }

  const paymentWindow = window.open('about:blank', '_blank')

  isPaying.value = true
  errorMessage.value = ''

  try {
    const locale = getCurrentLocale()
    const returnUrl = `${window.location.origin}/${locale}/payment/success`
    const selectedPlan = selectedPlanDetails.value || getSelectedPlan.value
    const pendingSubscription = getSerializableSubscriptionData()

    const checkout = await createJekoCheckout({
      userId: normalizeJekoUserId(subscriptionForm.value.userId),
      business: jekoBusiness.value,
      amount: amount * CS_JEKO_PROD,
      currency: 'XOF',
      paymentMethod: esjekoPaymentMethod.value,
      // return_url: jekoReturnUrl.value,
      metadata: {
        source: 'nuxt',
        planId: subscriptionForm.value.planId,
        email: subscriptionForm.value.email,
        phone: subscriptionForm.value.phone,
        transactionId,
        frontendReturnUrl: `${returnUrl}?reference={reference}`
      }
    })

    localStorage.setItem(JEKO_CHECKOUT_REFERENCE_KEY, checkout.reference)
    localStorage.setItem(JEKO_CHECKOUT_DETAILS_KEY, JSON.stringify(checkout))
    localStorage.setItem(JEKO_PENDING_SUBSCRIPTION_KEY, JSON.stringify(pendingSubscription))

    console.log('✅ Checkout Jeko créé:', {
      reference: checkout.reference,
      paymentRequestId: checkout.paymentRequestId,
      plan: selectedPlan?.name
    })

    if (paymentWindow) {
      paymentWindow.location.href = checkout.redirectUrl
    } else {
      await navigateTo(checkout.redirectUrl, { external: true })
    }
  } catch (error: any) {
    paymentWindow?.close()
    console.error('❌ Erreur checkout Jeko:', error)
    errorMessage.value = jekoCheckoutError.value || error?.message || 'Erreur lors de la création du paiement'
    isPaying.value = false
  }
}

const handleCreateSubscription = async () => {
  // Plans gratuits (free ou prix=0 comme student_iua) → pas de paiement Jeko
  const planPrice = selectedPlanPrice.value
  if (subscriptionForm.value.planId === freePlan.value || planPrice === 0) {
    return completeSubscription()
  }

  console.log('💳 Déclenchement du paiement Jeko...')
  await payWithJeko(planPrice)
}

/**
 * Étape 5: Finaliser
 */
const handleFinish = () => {
  // Récupérer la locale courante
  const pathParts = window.location.pathname.split('/')
  const locale = ['fr', 'en'].includes(pathParts[1]) ? pathParts[1] : 'fr'

  // Pour les plans étudiants en attente de validation, retourner à l'accueil
  const plan = selectedPlanDetails.value || getSelectedPlan.value
  if (plan && (plan.type === 'student' || plan.type === 'student_iua' || plan.id === 'student' || plan.id === 'student_iua')) {
    router.push(`/${locale}/alt-news`)
    return
  }

  // Redirection vers l'espace abonné
  router.push(`/${locale}/subscriber/manage`)
}
</script>

<style scoped>
.subscription-email-wrapper {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 700px;
  margin: 0 auto;
}

/* ========== STEP STYLING ========== */
.step {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-header h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-weight: 700;
}

.step-header p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

/* ========== FORM STYLING ========== */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-control:focus {
  outline: none;
  border-color: #d4b128;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 177, 40, 0.1);
}

.form-control:disabled {
  background-color: #f5f5f5;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-control.disabled {
  background-color: #f5f5f5;
  color: #6b7280;
}

.form-text {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.empty-articles {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-articles .empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-articles h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* ========== BUTTON STYLING ========== */
.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary {
  background-color: #d4b128;
  color: white;
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 177, 40, 0.4);
  opacity: 0.9;
}

.btn-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-lg {
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1.1rem;
}

.btn-link {
  background: none;
  border: none;
  color: #d4b128;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  text-decoration: underline;
  font-weight: 600;
}

.btn-link:hover {
  opacity: 0.8;
}

.login-link-wrapper {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.login-text {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.btn-retry {
  background-color: #d4b128;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  margin-top: 0.625rem;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 0.625rem;
  margin-top: 1.5rem;
}

.button-group .btn-primary {
  flex: 1;
}

/* ========== ALERT STYLING ========== */
.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-success {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #86efac;
}

.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.input-warning {
  border-color: #f59e0b !important;
  background-color: #fffbeb !important;
}

.email-checking {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-link-warning {
  background: none;
  border: none;
  color: #d4b128;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 0.875rem;
  text-decoration: underline;
  font-weight: 600;
}

.btn-link-warning:hover {
  color: #b89a22;
}

/* Section justificatif étudiant */
.student-proof-section {
  background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%);
  border: 2px solid #9E73B0;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}

.upload-zone {
  position: relative;
  border: 2px dashed #9E73B0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #7B1FA2;
  background: #faf5ff;
}

.upload-zone.has-file {
  border-style: solid;
  border-color: #10b981;
  background: #f0fdf4;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #7B1FA2;
  cursor: pointer;
}

.upload-label .success-icon {
  color: #10b981;
}

.upload-label span {
  font-size: 1rem;
  font-weight: 600;
}

.upload-label small {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: normal;
}

.file-name {
  color: #10b981 !important;
}

/* Section moyens de paiement */
.payment-methods-section {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}

.payment-methods-loading {
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.875rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 72px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-card:hover {
  border-color: #d4b128;
  background: #fffdf5;
}

.payment-method-card.selected {
  border-color: #d4b128;
  background: #fff8dc;
  box-shadow: 0 4px 14px rgba(212, 177, 40, 0.18);
}

.payment-method-card input {
  width: 18px;
  height: 18px;
  accent-color: #d4b128;
  flex-shrink: 0;
}

.method-logo {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #ffffff;
  color: #6b7280;
  overflow: hidden;
}

.method-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.method-name {
  color: #1f2937;
  font-weight: 700;
  overflow-wrap: anywhere;
}

/* ========== INFO BOX ========== */
.info-box {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-left: 4px solid #d4b128;
  padding: 1rem;
  margin-top: 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #d4b128;
}

.info-box p {
  margin: 0;
}

/* ========== PLAN CONFIRMATION CARD ========== */
.plan-confirmation-step {
  text-align: center;
}

.selected-plan-card {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border: 3px solid #d4b128;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.plan-badge {
  display: inline-block;
  background-color: #d4b128;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.plan-info h3 {
  font-size: 1.8rem;
  color: #1f2937;
  margin: 0.5rem 0;
  font-weight: 700;
}

.plan-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0.75rem 0 1.5rem 0;
}

.plan-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(212, 177, 40, 0.1);
}

.plan-details .detail {
  display: flex;
  flex-direction: column;

  
}

.plan-details .label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  margin-right: 1rem;
}

.detail{
  display: flex;
  gap: 12px
}

.plan-details .value {
  font-size: 1.25rem;
  color: #d4b128;
  font-weight: 700;
}

.features-list {
  text-align: left;
}

.features-list h4 {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.features-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  color: #6b7280;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.features-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: 700;
}

/* ========== USER INFO CARD ========== */
.user-info-card {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border: 2px solid #f5d7b8;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  margin-bottom: 1rem;
}

.info-item label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
}

/* ========== CHECKBOX STYLING ========== */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
  padding-left: 2rem;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  position: absolute;
  left: 0;
  top: 2px;
  height: 20px;
  width: 20px;
  background-color: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checkbox-input:checked ~ .checkbox-custom {
  background-color: #d4b128;
  border-color: #d4b128;
}

.checkbox-input:checked ~ .checkbox-custom::after {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

/* ========== PLANS GRID ========== */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.plan-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: white;
}

.plan-card:hover {
  border-color: #d4b128;
  box-shadow: 0 8px 24px rgba(212, 177, 40, 0.15);
  transform: translateY(-4px);
}

.plan-card.selected {
  border-color: #d4b128;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  box-shadow: 0 8px 24px rgba(212, 177, 40, 0.2);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.plan-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-free {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #86efac;
}

.plan-price {
  margin: 1rem 0;
}

.amount {
  font-size: 1.75rem;
  font-weight: 800;
  color: #d4b128;
  display: block;
}

.duration {
  font-size: 0.875rem;
  color: #9ca3af;
}

.description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.75rem 0;
  min-height: 40px;
}

.features {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
  font-size: 0.875rem;
}

.features li {
  margin: 0.5rem 0;
  color: #6b7280;
  padding-left: 1.5rem;
  position: relative;
}

.features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: 700;
}

.btn-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-select:hover {
  border-color: #d4b128;
  color: #d4b128;
}

.btn-select.selected {
  background-color: #d4b128;
  color: white;
  border-color: #d4b128;
}

/* ========== LOADING STATE ========== */
.loading-state {
  text-align: center;
  padding: 2.5rem 1.25rem;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #d4b128;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.spinner-icon {
  display: inline-block;
  animation: spin 1s linear infinite;
}

/* ========== CONFIRMATION ========== */
.pending-validation-box {
  background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.pending-icon {
  color: #d97706;
  margin-bottom: 0.75rem;
}

.pending-validation-box h2 {
  color: #92400e;
  margin: 0.75rem 0;
  font-size: 1.5rem;
}

.pending-message {
  color: #78350f;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.validation-info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  text-align: left;
  border: 1px solid #fde68a;
}

.validation-info-icon {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 2px;
}

.validation-info-content h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.validation-info-content p {
  font-size: 0.9rem;
  color: #78350f;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.validation-delay {
  font-size: 0.85rem !important;
  color: #b45309 !important;
}

.status-pending {
  color: #d97706 !important;
  background: #fef3c7;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem !important;
}

.success-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 3rem;
  color: #16a34a;
  margin-bottom: 0.75rem;
  display: inline-block;
}

.success-box h2 {
  color: #15803d;
  margin: 0.75rem 0;
  font-size: 1.5rem;
}

.success-box p {
  color: #15803d;
  margin: 0.375rem 0;
  font-size: 0.95rem;
}

.confirmation-details {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border: 2px solid #f5d7b8;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 177, 40, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-item label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-item p {
  margin: 0.375rem 0 0 0;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
}

.confirmation-message {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

/* ========== ARTICLE SELECTION STYLING ========== */
.article-selection-section {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border: 2px solid #f5d7b8;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}

.selection-header {
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.selection-header h3 {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.selection-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0.5rem 0 1rem 0;
}

.required-badge {
  display: inline-block;
  background-color: #dc2626;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.articles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.article-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.article-option:hover {
  border-color: #d4b128;
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.1);
  transform: translateX(4px);
}

.article-option.selected {
  border-color: #d4b128;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.2);
}

.article-radio {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.article-radio input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.article-option.selected .article-radio::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #d4b128;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.article-info {
  flex: 1;
  margin-left: 0.5rem;
}

.article-info h4 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 700;
}

.article-date {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.article-price {
  text-align: right;
  font-size: 1.1rem;
  font-weight: 700;
  color: #d4b128;
}

/* ========== UTILITIES ========== */
.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 1.5rem;
}

.mt-4 {
  margin-top: 2rem;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .subscription-email-wrapper {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .step-header h2 {
    font-size: 1.5rem;
  }

  .success-box {
    padding: 1.5rem;
  }

  .success-icon {
    font-size: 2.5rem;
  }
}
</style>
