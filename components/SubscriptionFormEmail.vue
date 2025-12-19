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
        <h2>Bienvenue de retour! 👋</h2>
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
          ✓ C'est correct, continuer
        </button>
        <button @click="editProfile" class="btn btn-secondary">
          ✎ Modifier ces informations
        </button>
      </div>
    </section>

    <!-- ========== ÉTAPE 2B: NOUVEL UTILISATEUR ========== -->
    <section v-if="currentStep === 'new-user' && !userExists" class="step new-user-step">
      <div class="step-header">
        <h2>Créer votre compte</h2>
        <p>Complétez vos informations pour continuer</p>
      </div>

      <form @submit.prevent="handleRegistration" class="registration-form">
        <!-- Email (non modifiable) -->
        <div class="form-group">
          <label for="email-display">Email</label>
          <input
            id="email-display"
            v-model="subscriptionForm.email"
            type="email"
            disabled
            class="form-control disabled"
          />
          <small class="form-text">Non modifiable</small>
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
            <span v-else>✓ Enregistrer les modifications</span>
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
    <section v-if="currentStep === 'select-plan' && subscriptionForm.planId && subscriptionForm.userId" class="step finalization-step">
      <div class="step-header">
        <h2>Récapitulatif de votre abonnement</h2>
        <p>Vérifiez les détails avant de finaliser</p>
      
      </div>

      <!-- Afficher le détail du plan sélectionné -->
      <div v-if="selectedPlanDetails || getSelectedPlan" class="selected-plan-summary">
        <div class="plan-card-summary">
          <div class="plan-header">
            <h3>{{ (selectedPlanDetails || getSelectedPlan).name }}</h3>
            <span v-if="selectedPlanDetails?.id !== freePlan" class="plan-price">
              {{ formatPrice((selectedPlanDetails || getSelectedPlan).price) }}/mois
            </span>
            <span v-else style="color: var(--cs-brown-color); font: bold;" class="plan-price">
              Accès limité à l’intégralité de la revue
            </span>
          </div>
          
          <p class="plan-description">{{ (selectedPlanDetails || getSelectedPlan).description }}</p>
          
          <div class="plan-details-summary">
            
            
            <div class="detail">
              <span class="label">Nom:</span>
              <span class="value">{{ subscriptionForm.firstName }} {{ subscriptionForm.lastName }}</span>
            </div>
            <div v-if="subscriptionForm.userId" class="detail">
              <span class="label">Téléphone:</span>
              <span class="value"> {{ subscriptionForm.phone }} </span>
            </div>
            <div class="detail">
              <span class="label">Email:</span>
              <!-- existingUserData -->
              <span class="value">{{ subscriptionForm.email }}  </span>
            </div>
            <div v-if="(selectedPlanDetails || getSelectedPlan).duration" class="detail">
              <span class="label">Durée:</span>
              <span class="value">{{ (selectedPlanDetails || getSelectedPlan).duration }} jours</span>
            </div>
            
          </div>

          <div style="margin-block: 1rem;" class="features-summary">
            <h4>Ce plan inclut:</h4>
            <ul style="list-style:none" >
              <li  v-for="(feature, i) in (selectedPlanDetails || getSelectedPlan).features" :key="i">
                 {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Newsletter checkbox -->
      <div class="form-group mt-4">
        <label>
          <input v-model="subscriptionForm.newsletter" type="checkbox" />
          M'envoyer la newsletter
        </label>
      </div>

      <!-- Affichage des erreurs -->
      <div v-if="errorMessage" class="alert alert-error mt-3">
        {{ errorMessage }}
      </div>

      <!-- selectionnez votre numéro -->
      <div v-if="selectedPlanDetails?.id === monthlyPlan" class="article-selection-section">
        <div class="selection-header">
          <h3> <Icon icon="material-symbols:news-rounded" width="24" height="24" /> Sélectionnez le numéro d'article</h3>
          <p class="selection-subtitle">Choisissez l'édition ALT News que vous souhaitez acheter</p>
          <span class="required-badge">Obligatoire</span>
        </div>

        <div class="articles-grid">
          <div
            v-for="article in availableArticles"
            :key="article.id"
            class="article-option"
            :class="{ selected: selectedArticle === article.id }"
            @click="selectedArticle = article.id"
            
          >
            <div class="article-radio">
              <input
                type="radio"
                :id="`article-${article.id}`"
                :value="article.id"
                v-model="selectedArticle"
                :required="selectedPlanDetails?.id === monthlyPlan"
              />
            </div>
            <div class="article-info">
              <h4>{{ article.number }}</h4>
              <p class="article-date"><Icon icon="clarity:date-solid" width="24" height="24" />  {{ article.date }}</p>
            </div>
           
          </div>
        </div>

        <!-- Validation error -->
        <div v-if="selectedPlanDetails?.id === monthlyPlan && !selectedArticle" class="alert alert-error mt-3">
          ⚠️ Veuillez sélectionner un numéro d'article pour continuer
        </div>
      </div>
      <!-- selectionnez votre numéro -->

      <!-- Bouton de finalisation -->
      <div class="button-group mt-4">
        <button
          @click="handleCreateSubscription"
          :disabled="isProcessing || (selectedPlanDetails?.id === monthlyPlan && !selectedArticle)"
          class="btn btn-primary btn-lg"
        >
          <span v-if="isProcessing">Création de l'abonnement...</span>
          <span v-else>✓ Finaliser mon abonnement</span>
        </button>
      </div>
    </section>

    <!-- ========== ÉTAPE 5: CONFIRMATION ========== -->
    <section v-if="currentStep === 'confirmation'" class="step confirmation-step">
      <div class="success-box">
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
          <p>{{ getSelectedPlan?.name }}</p>
        </div>
      </div>

      <p class="confirmation-message">
        Un email de confirmation a été envoyé à <strong>{{ subscriptionForm.email }}</strong>
      </p>

      <button @click="handleFinish" class="btn btn-primary btn-lg">
        Accéder à mon compte →
      </button>

      <!-- Composant Cinetpay pour le paiement -->
     
    </section>
  </div>
  
  <!-- Composant Cinetpay pour le paiement -->
  <Cinetpay
    ref="cinetpayRef"
    :first-name="subscriptionForm.firstName"
    :last-name="subscriptionForm.lastName"
    :user-name="subscriptionForm.firstName + ' ' + subscriptionForm.lastName"
    :amount="(selectedPlanDetails || getSelectedPlan)?.price || 0"
    :email="subscriptionForm.email"
    :phone="subscriptionForm.phone"
    :structure="'CS-CONSEIL'"
    :service="'Subscription'"
    :transaction-id="transactionId" 
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscription } from '~/composables/useSubscription'
import Cinetpay from '~/components/Cinetpay.vue'
import {Icon} from "@iconify/vue"

const router = useRouter()
const cinetpayRef = ref<InstanceType<typeof Cinetpay> | null>(null)
const isPaying = ref(false)
const freePlan = ref("a4b34a9f-95e2-447b-9d9f-73028853f2fb")
const monthlyPlan = ref("e4609624-47af-4147-a701-396ef6130542")

const transactionId = `TXN_altnews_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Articles disponibles pour les abonnements mensuels
const availableArticles = ref([
  { id: 'dec-2025', number: 'Décembre 2025', date: '15 Décembre 2025' },
  { id: 'nov-2025', number: 'Novembre 2025', date: '15 Novembre 2025' },
  { id: 'oct-2025', number: 'Octobre 2025', date: '15 Octobre 2025' },
  { id: 'sep-2025', number: 'Septembre 2025', date: '15 Septembre 2025' },
  { id: 'aug-2025', number: 'Août 2025', date: '15 Août 2025' },
  { id: 'jul-2025', number: 'Juillet 2025', date: '15 Juillet 2025' }
])

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
const selectedArticle = ref<string | null>(null)

// Charger les plans au montage
onMounted(() => {
  fetchPlans()
  
  // Restaurer le plan depuis localStorage s'il existe
  const savedPlan = localStorage.getItem('selectedPlan')
  if (savedPlan) {
    try {
      const parsedPlan = JSON.parse(savedPlan)
      selectedPlanDetails.value = parsedPlan
      // IMPORTANT: Restaurer le planId dans subscriptionForm
      if (parsedPlan.id) {
        subscriptionForm.value.planId = parsedPlan.id
        selectedPlanBeforeAuth.value = parsedPlan.id
      }
    } catch (e) {
      console.error('Erreur lors de la restauration du plan:', e)
    }
  }
  
  // Rester sur l'étape email-check par défaut
  currentStep.value = 'email-check'
})

// Restaurer le plan sélectionné après chargement des plans
watch(subscriptionPlans, (newPlans) => {
  if (newPlans.length > 0 && selectedPlanBeforeAuth.value) {
    subscriptionForm.value.planId = selectedPlanBeforeAuth.value
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
      userId: result.user.id,  // ← Le userId vient de user.id pour register
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
  }
  // Les erreurs s'affichent dans errorMessage
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
  const subscriptionData = {...subscriptionForm.value, transactionId}
  
  // Ajouter l'article sélectionné si c'est un plan mensuel
  if (selectedPlanDetails.value?.id === monthlyPlan.value && selectedArticle.value) {
    (subscriptionData as any).articleNumber = selectedArticle.value
    console.log('📰 Article sélectionné:', selectedArticle.value)
  }
  
  const success = await createSubscription(subscriptionData)
  if (success) {
    console.log('✅ Abonnement créé avec succès!')
    router.push('/subscriber/success')
  } else {
    console.error('❌ Erreur lors de la création de l\'abonnement')
    isPaying.value = false
  }
}

/**
 * Étape 4: Déclencher le paiement Cinetpay
 */
const handleCreateSubscription = async () => {
  
  if(subscriptionForm.value.planId === freePlan.value){
    return completeSubscription()
  }

  // return completeSubscription()
  console.log('🔘 Bouton de paiement cliqué...') 
  
  // Vérifier que le composant Cinetpay est prêt
  if (!cinetpayRef.value) {
    console.error('❌ Composant Cinetpay non initialisé')
    alert('Erreur: Composant de paiement non prêt')
    return
  }
  
  // Vérifier que les données sont valides
  if (!subscriptionForm.value.email || !subscriptionForm.value.phone) {
    console.error('❌ Données d\'abonnement incomplètes')
    alert('Veuillez remplir tous les champs requis')
    return
  }
  
  isPaying.value = true
  console.log('💳 Déclenchement du paiement Cinetpay...')
  
  // ✨ APPEL DIRECT À checkout() avec callback
  cinetpayRef.value?.checkout(completeSubscription)
}

/**
 * Étape 5: Finaliser
 */
const handleFinish = () => {
  // Redirection vers le dashboard
  router.push('/subscriber/success')
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
  border-color: var(--cs-brown-color, #8b5c2e);
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 46, 0.1);
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
  background-color: var(--cs-brown-color, #8b5c2e);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
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
  color: var(--cs-brown-color, #8b5c2e);
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  text-decoration: underline;
  font-weight: 600;
}

.btn-link:hover {
  opacity: 0.8;
}

.btn-retry {
  background-color: var(--cs-brown-color, #8b5c2e);
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

/* ========== INFO BOX ========== */
.info-box {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-left: 4px solid var(--cs-brown-color, #8b5c2e);
  padding: 1rem;
  margin-top: 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #8b5c2e;
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
  border: 3px solid var(--cs-brown-color, #8b5c2e);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.plan-badge {
  display: inline-block;
  background-color: var(--cs-brown-color, #8b5c2e);
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
  border-bottom: 1px solid rgba(139, 92, 46, 0.1);
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
  color: var(--cs-brown-color, #8b5c2e);
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
  background-color: var(--cs-brown-color, #8b5c2e);
  border-color: var(--cs-brown-color, #8b5c2e);
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
  border-color: var(--cs-brown-color, #8b5c2e);
  box-shadow: 0 8px 24px rgba(139, 92, 46, 0.15);
  transform: translateY(-4px);
}

.plan-card.selected {
  border-color: var(--cs-brown-color, #8b5c2e);
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  box-shadow: 0 8px 24px rgba(139, 92, 46, 0.2);
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
  color: var(--cs-brown-color, #8b5c2e);
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
  border-color: var(--cs-brown-color, #8b5c2e);
  color: var(--cs-brown-color, #8b5c2e);
}

.btn-select.selected {
  background-color: var(--cs-brown-color, #8b5c2e);
  color: white;
  border-color: var(--cs-brown-color, #8b5c2e);
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
  border-top: 4px solid var(--cs-brown-color, #8b5c2e);
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
  border-bottom: 1px solid rgba(139, 92, 46, 0.1);
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
  border-color: var(--cs-brown-color, #8b5c2e);
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.1);
  transform: translateX(4px);
}

.article-option.selected {
  border-color: var(--cs-brown-color, #8b5c2e);
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.2);
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
  background-color: var(--cs-brown-color, #8b5c2e);
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
  color: var(--cs-brown-color, #8b5c2e);
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
