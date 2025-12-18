/**
 * Exemple pratique: Composant d'inscription avec logique email/register
 * Montre comment intégrer checkEmail() et registerUser() dans un vrai composant
 */

// ===== EXEMPLE 1: Workflow complet pas à pas =====
export const Example1_CompleteWorkflow = `
<template>
  <div class="subscription-container">
    <!-- ÉTAPE 1: Vérification d'email -->
    <section v-if="currentStep === 'email-verification'" class="step email-step">
      <h2>Bienvenue!</h2>
      <p>Entrez votre email pour continuer</p>
      
      <form @submit.prevent="verifyEmail">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="emailInput" 
            type="email" 
            required
            placeholder="votre@email.com"
            :disabled="emailCheckLoading"
          />
        </div>

        <button 
          type="submit" 
          :disabled="emailCheckLoading"
          class="btn-primary"
        >
          <span v-if="emailCheckLoading">Vérification...</span>
          <span v-else>Continuer</span>
        </button>

        <div v-if="emailCheckError" class="alert alert-error">
          {{ emailCheckError }}
        </div>
      </form>
    </section>

    <!-- ÉTAPE 2: Enregistrement (si nouvel utilisateur) -->
    <section v-if="currentStep === 'registration' && !userExists" class="step register-step">
      <h2>Créer votre compte</h2>
      <p>Complétez votre inscription</p>
      
      <form @submit.prevent="registerAccount">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="subscriptionForm.email" 
            type="email" 
            disabled
            class="disabled"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe*</label>
          <input 
            v-model="password" 
            type="password" 
            required
            minlength="8"
            placeholder="Minimum 8 caractères"
          />
          <small>Utilisé pour sécuriser votre compte</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Prénom*</label>
            <input 
              v-model="subscriptionForm.firstName" 
              type="text" 
              required
              placeholder="John"
            />
          </div>

          <div class="form-group">
            <label>Nom*</label>
            <input 
              v-model="subscriptionForm.lastName" 
              type="text" 
              required
              placeholder="Doe"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Téléphone*</label>
          <input 
            v-model="subscriptionForm.phone" 
            type="tel" 
            required
            placeholder="+33612345678"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isProcessing"
          class="btn-primary"
        >
          <span v-if="isProcessing">Création du compte...</span>
          <span v-else>Créer mon compte</span>
        </button>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <p class="text-center text-sm">
          <a href="#" @click.prevent="currentStep = 'email-verification'">
            ← Changer d'email
          </a>
        </p>
      </form>
    </section>

    <!-- ÉTAPE 2 BIS: Utilisateur existant (pas d'enregistrement) -->
    <section v-if="currentStep === 'registration' && userExists" class="step welcome-step">
      <div class="alert alert-success">
        <h3>Bienvenue de retour {{ existingUserData.firstName }}!</h3>
        <p>Nous avons retrouvé votre profil. Continuons vers le choix du plan.</p>
      </div>

      <button 
        @click="currentStep = 'plan-selection'"
        class="btn-primary"
      >
        Continuer vers les plans →
      </button>
    </section>

    <!-- ÉTAPE 3: Sélection du plan -->
    <section v-if="currentStep === 'plan-selection'" class="step plans-step">
      <h2>Choisir votre plan d'abonnement</h2>
      <p>
        {{ userExists ? existingUserData.firstName : subscriptionForm.firstName }},
        quel plan vous intéresse?
      </p>

      <div v-if="plansLoading" class="loading">
        Chargement des plans...
      </div>

      <div v-else-if="plansError" class="alert alert-error">
        {{ plansError }}
        <button @click="fetchPlans">Réessayer</button>
      </div>

      <div v-else class="plans-grid">
        <div 
          v-for="plan in subscriptionPlans" 
          :key="plan.id"
          :class="['plan-card', { selected: subscriptionForm.planId === plan.id }]"
          @click="selectPlan(plan.id)"
        >
          <h3>{{ plan.name }}</h3>
          <p class="price">{{ formatPrice(plan.price) }}</p>
          <p class="duration">{{ plan.duration }} jours</p>
          <p class="description">{{ plan.description }}</p>

          <ul class="features">
            <li v-for="(feature, i) in plan.features" :key="i">
              ✓ {{ feature }}
            </li>
          </ul>

          <button 
            type="button"
            :class="['btn', { 'btn-selected': subscriptionForm.planId === plan.id }]"
          >
            {{ subscriptionForm.planId === plan.id ? '✓ Sélectionné' : 'Choisir' }}
          </button>
        </div>
      </div>

      <div class="form-group" v-if="subscriptionForm.planId">
        <label>
          <input v-model="subscriptionForm.newsletter" type="checkbox" />
          S'abonner à la newsletter
        </label>
      </div>

      <button 
        v-if="subscriptionForm.planId"
        @click="handleCreateSubscription"
        :disabled="isProcessing"
        class="btn-primary btn-large"
      >
        <span v-if="isProcessing">Création de l'abonnement...</span>
        <span v-else>Finaliser mon abonnement</span>
      </button>

      <p class="text-center">
        <a href="#" @click.prevent="currentStep = 'registration'">
          ← Changer les informations
        </a>
      </p>
    </section>

    <!-- ÉTAPE 4: Confirmation -->
    <section v-if="currentStep === 'confirmation'" class="step confirmation-step">
      <div class="alert alert-success">
        <h2>✓ Abonnement créé avec succès!</h2>
        <p>Votre abonnement est maintenant actif.</p>
        <p>Un email de confirmation a été envoyé à {{ subscriptionForm.email }}</p>
      </div>

      <button @click="handleFinish" class="btn-primary">
        Accéder à mon compte →
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '~/composables/useSubscription'

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
  processingStep,
} = useSubscription()

// Local state
const currentStep = ref<'email-verification' | 'registration' | 'plan-selection' | 'confirmation'>('email-verification')
const emailInput = ref('')
const password = ref('')

onMounted(() => {
  fetchPlans()
})

const verifyEmail = async () => {
  const result = await checkEmail(emailInput.value)
  
  if (!result.error) {
    // Email vérifié, passer à l'étape suivante
    subscriptionForm.value.email = emailInput.value
    currentStep.value = 'registration'
  }
  // Les erreurs s'affichent dans emailCheckError
}

const registerAccount = async () => {
  const result = await registerUser(
    subscriptionForm.value.email,
    password.value,
    subscriptionForm.value.firstName,
    subscriptionForm.value.lastName,
    subscriptionForm.value.phone
  )

  if (result.success) {
    currentStep.value = 'plan-selection'
  }
  // Les erreurs s'affichent dans errorMessage
}

const handleCreateSubscription = async () => {
  const success = await createSubscription({})
  if (success) {
    currentStep.value = 'confirmation'
  }
}

const handleFinish = () => {
  // Redirection ou fermeture du modal
  window.location.href = '/subscriber/dashboard'
}
</script>

<style scoped>
.subscription-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.plan-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.plan-card.selected {
  border-color: #007bff;
  background-color: #f0f7ff;
}

.plan-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.plan-card .price {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin: 5px 0;
}

.plan-card .features {
  list-style: none;
  padding: 10px 0;
  font-size: 12px;
}

.plan-card .features li {
  margin: 5px 0;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 12px;
}

.disabled {
  background-color: #f5f5f5;
  color: #999;
}

.loading {
  text-align: center;
  padding: 20px;
}
</style>
`

// ===== EXEMPLE 2: Logique minimaliste =====
export const Example2_MinimalLogic = {
  async handleSubscriptionFlow() {
    const { checkEmail, registerUser, selectPlan, createSubscription } = useSubscription()

    // Étape 1: Vérifier email
    const checkResult = await checkEmail('user@example.com')

    if (checkResult.exists) {
      // Utilisateur existe - formulaire pré-rempli
      console.log('Utilisateur trouvé:', checkResult.user)
    } else {
      // Nouvel utilisateur - enregistrement
      const registerResult = await registerUser(
        'user@example.com',
        'password123!',
        'John',
        'Doe',
        '+33612345678'
      )

      if (!registerResult.success) {
        console.error('Erreur enregistrement:', registerResult.error)
        return
      }
    }

    // Étape 2: Sélectionner un plan
    selectPlan('plan-id-uuid')

    // Étape 3: Créer l'abonnement
    const subResult = await createSubscription({})
    
    if (subResult) {
      console.log('Abonnement créé!')
    }
  }
}

// ===== EXEMPLE 3: Gestion des erreurs =====
export const Example3_ErrorHandling = {
  async handleWithErrors() {
    const { checkEmail, emailCheckError } = useSubscription()

    try {
      const result = await checkEmail('invalid-email')

      if (!result.exists && !result.error) {
        console.log('Nouvel utilisateur')
      } else if (result.error) {
        console.error('Erreur vérification:', emailCheckError.value)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }
}

// ===== EXEMPLE 4: États réactifs =====
export const Example4_ReactiveStates = {
  template: \`
    <!-- Afficher loading state -->
    <div v-if="emailCheckLoading" class="spinner">Vérification...</div>

    <!-- Afficher erreur -->
    <div v-if="emailCheckError" class="error">{{ emailCheckError }}</div>

    <!-- Afficher utilisateur trouvé -->
    <div v-if="userExists" class="success">
      Bienvenue {{ existingUserData.firstName }}!
    </div>

    <!-- Afficher processing state -->
    <button :disabled="isProcessing">
      {{ isProcessing ? 'En cours...' : 'Valider' }}
    </button>

    <!-- Afficher erreur enregistrement -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  \`
}

export default {
  Example1_CompleteWorkflow,
  Example2_MinimalLogic,
  Example3_ErrorHandling,
  Example4_ReactiveStates
}
