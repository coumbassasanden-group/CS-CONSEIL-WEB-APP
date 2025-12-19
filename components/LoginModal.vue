<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="login-modal-overlay" @click.self="close">
        <div class="login-modal">
          <div class="modal-header">
            <h3>Connexion à votre compte</h3>
            <button class="btn-close" @click="close" type="button">
              <span>×</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- ========== FORMULAIRE DE CONNEXION ========== -->
            <form v-if="!showForgotPassword" @submit.prevent="handleLogin">
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="password">Mot de passe</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="Votre mot de passe"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group-checkbox">
                <label class="checkbox-label">
                  <input
                    v-model="form.remember"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  class="forgot-link"
                  @click="showForgotPassword = true"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div v-if="error" class="error-message">
                {{ error }}
              </div>

              <button
                type="submit"
                class="btn-login"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Se connecter</span>
              </button>
            </form>

            <!-- ========== FORMULAIRE MOT DE PASSE OUBLIÉ ========== -->
            <form v-else @submit.prevent="handleForgotPassword" class="forgot-password-form">
              <div class="forgot-header">
                <button
                  type="button"
                  class="btn-back"
                  @click="backToLogin"
                >
                  ← Retour
                </button>
              </div>

              <h4 class="forgot-title">Réinitialiser votre mot de passe</h4>
              <p class="forgot-description">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              <div class="form-group">
                <label for="forgot-email">Adresse email</label>
                <input
                  id="forgot-email"
                  v-model="forgotForm.email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  class="form-input"
                />
              </div>

              <div v-if="forgotError" class="error-message">
                {{ forgotError }}
              </div>

              <div v-if="forgotSuccess" class="success-message">
                ✓ Vérifiez votre email ! Un lien de réinitialisation vous a été envoyé.
              </div>

              <button
                type="submit"
                class="btn-login"
                :disabled="isLoadingForgot || forgotSuccess"
              >
                <span v-if="isLoadingForgot" class="spinner"></span>
                <span v-else-if="forgotSuccess">Email envoyé ✓</span>
                <span v-else>Envoyer le lien de réinitialisation</span>
              </button>
            </form>

            <div class="modal-footer">
              <p v-if="!showForgotPassword">Pas encore de compte ? <a href="/subscriber" class="register-link">S'inscrire</a></p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Type pour la réponse de connexion
interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  token: string
}

// Props
interface Props {
  modelValue: boolean
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'login-success', user: any): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<Emits>()
const router = useRouter()

// État - Connexion
const isLoading = ref(false)
const error = ref('')
const form = ref({
  email: '',
  password: '',
  remember: false
})

// État - Mot de passe oublié
const showForgotPassword = ref(false)
const isLoadingForgot = ref(false)
const forgotError = ref('')
const forgotSuccess = ref(false)
const forgotForm = ref({
  email: ''
})

// Accesseurs
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Méthodes
const close = () => {
  isOpen.value = false
  // Réinitialiser le formulaire après fermeture
  setTimeout(() => {
    resetForm()
  }, 300)
}

const resetForm = () => {
  form.value = {
    email: '',
    password: '',
    remember: false
  }
  error.value = ''
}

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiSubcriptionUrl || 'http://localhost:3001/api/'

    console.log('🔐 Tentative de connexion avec:', form.value.email)

    // Appel à l'endpoint de connexion
    const response = await $fetch<LoginResponse>(`${apiUrl}auth/login`, {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password
      }
    })

    if (response && response.user && response.token) {
      console.log('✅ Connexion réussie pour:', response.user.email)

      // Sauvegarder les données de l'utilisateur
      localStorage.setItem('authUser', JSON.stringify(response.user))

      // Sauvegarder le token JWT
      localStorage.setItem('authToken', response.token)

      // Sauvegarder les données de connexion pour la réutilisation
      localStorage.setItem('authData', JSON.stringify({
        user: response.user,
        token: response.token,
        loginTime: new Date().toISOString()
      }))

      // Émettre l'événement de succès
      emit('login-success', response.user)

      // Nettoyer le formulaire
      resetForm()

      // Fermer la modal
      isOpen.value = false

      // Redirection vers la page de gestion
      setTimeout(() => {
        router.push('/subscriber/manage')
      }, 500)
    }
  } catch (err: any) {
    console.error('❌ Erreur lors de la connexion:', err)
    error.value = err?.data?.message || 'Email ou mot de passe incorrect'
  } finally {
    isLoading.value = false
  }
}

/**
 * Gérer la demande de réinitialisation de mot de passe
 * SIMULATION: Simule l'envoi d'email pour le moment
 */
const handleForgotPassword = async () => {
  forgotError.value = ''
  isLoadingForgot.value = true

  try {
    console.log('📧 Demande de réinitialisation pour:', forgotForm.value.email)

    // SIMULATION: Simule un délai d'envoi (500-1500ms)
    await new Promise(resolve => setTimeout(resolve, 800))

    // SIMULATION: Simule un succès (95% de chance)
    // En production, ceci sera remplacé par l'appel API réel
    const shouldSucceed = Math.random() < 0.95

    if (!shouldSucceed) {
      throw new Error('Email non trouvé dans la base de données')
    }

    console.log('✅ [SIMULATION] Email de réinitialisation envoyé à:', forgotForm.value.email)
    console.log('💡 En production, un email réel serait envoyé avec un lien de réinitialisation')
    
    // Afficher le message de succès
    forgotSuccess.value = true

    // Redirection automatique après 3 secondes
    setTimeout(() => {
      backToLogin()
    }, 3000)
  } catch (err: any) {
    console.error('❌ Erreur lors de la demande de réinitialisation:', err)
    forgotError.value = err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation'
  } finally {
    isLoadingForgot.value = false
  }
}

/**
 * Retourner au formulaire de connexion
 */
const backToLogin = () => {
  showForgotPassword.value = false
  forgotError.value = ''
  forgotSuccess.value = false
  forgotForm.value = {
    email: ''
  }
}
</script>

<style scoped>
/* Modal de connexion */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.login-modal {
  background: white;
  border-radius: 20px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.login-modal .modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 1.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.login-modal .modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: var(--cs-brown-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 46, 0.1);
}

.form-group-checkbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4b5563;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--cs-brown-color);
}

.forgot-link {
  color: var(--cs-brown-color);
  background: none;
  border: none;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.forgot-link:hover {
  opacity: 0.8;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-message {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 4px solid #16a34a;
}

/* ========== FORMULAIRE MOT DE PASSE OUBLIÉ ========== */
.forgot-password-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.forgot-header {
  margin-bottom: 1rem;
}

.btn-back {
  background: none;
  border: none;
  color: var(--cs-brown-color);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  opacity: 0.8;
}

.forgot-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0 0.5rem 0;
}

.forgot-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-login {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-modal .modal-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

.login-modal .modal-footer p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.register-link {
  color: var(--cs-brown-color);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.register-link:hover {
  opacity: 0.8;
}

/* Animation de la modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .login-modal,
.modal-leave-active .login-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .login-modal,
.modal-leave-to .login-modal {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .login-modal {
    max-width: 90%;
  }

  .login-modal .modal-body {
    padding: 1.5rem;
  }

  .login-modal .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .btn-login {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
