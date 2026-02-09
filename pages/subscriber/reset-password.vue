<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <!-- Logo et titre -->
      <div class="reset-header">
        <div class="logo">
          <span class="logo-text">ALT NEWS</span>
        </div>
        <h1>Réinitialiser votre mot de passe</h1>
        <p v-if="!success">Créez un nouveau mot de passe sécurisé pour votre compte.</p>
      </div>

      <!-- Formulaire de réinitialisation -->
      <form v-if="!success && !linkInvalid" @submit.prevent="handleResetPassword" class="reset-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            readonly
            class="form-input readonly"
          />
        </div>

        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimum 6 caractères"
              required
              minlength="6"
              class="form-input"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="password-strength" v-if="form.password">
            <div class="strength-bar" :class="passwordStrength.class"></div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirmer le mot de passe</label>
          <div class="password-input-wrapper">
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="Répétez votre mot de passe"
              required
              minlength="6"
              class="form-input"
              :class="{ 'error': form.password_confirmation && form.password !== form.password_confirmation }"
            />
            <button type="button" class="toggle-password" @click="showPasswordConfirm = !showPasswordConfirm">
              {{ showPasswordConfirm ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="form.password_confirmation && form.password !== form.password_confirmation" class="field-error">
            Les mots de passe ne correspondent pas
          </span>
          <span v-if="form.password_confirmation && form.password === form.password_confirmation && form.password.length >= 6" class="field-success">
            ✓ Les mots de passe correspondent
          </span>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="isLoading || form.password !== form.password_confirmation || form.password.length < 6"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Réinitialiser le mot de passe</span>
        </button>
      </form>

      <!-- Message de succès -->
      <div v-if="success" class="success-container">
        <div class="success-icon">✓</div>
        <h2>Mot de passe réinitialisé !</h2>
        <p>Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <NuxtLink :to="`/${currentLocale}/alt-news`" class="btn-login-redirect">
          Se connecter
        </NuxtLink>
      </div>

      <!-- Lien invalide ou expiré -->
      <div v-if="linkInvalid" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Lien invalide ou expiré</h2>
        <p>Ce lien de réinitialisation n'est plus valide. Veuillez faire une nouvelle demande de réinitialisation.</p>
        <NuxtLink :to="`/${currentLocale}/alt-news`" class="btn-back">
          Retour à l'accueil
        </NuxtLink>
      </div>

      <!-- Footer -->
      <div class="reset-footer">
        <p>© {{ new Date().getFullYear() }} CS CONSEIL - ALT NEWS</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Récupérer la locale courante
const currentLocale = computed(() => {
  const pathParts = route.path.split('/')
  const locale = pathParts[1]
  return ['fr', 'en'].includes(locale) ? locale : 'fr'
})

// État
const isLoading = ref(false)
const error = ref('')
const success = ref(false)
const linkInvalid = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const form = ref({
  email: '',
  token: '',
  password: '',
  password_confirmation: ''
})

// Calcul de la force du mot de passe
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return { class: '', text: '' }

  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength <= 2) return { class: 'weak', text: 'Faible' }
  if (strength <= 3) return { class: 'medium', text: 'Moyen' }
  return { class: 'strong', text: 'Fort' }
})

// Récupérer les paramètres de l'URL
onMounted(() => {
  const token = route.query.token as string
  const email = route.query.email as string

  if (!token || !email) {
    linkInvalid.value = true
    return
  }

  form.value.token = token
  form.value.email = decodeURIComponent(email)
})

// Soumettre le formulaire
const handleResetPassword = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const apiUrl = config.public.apiSubcriptionUrl || 'http://localhost:3001/api/'

    await $fetch(`${apiUrl}subscription/auth/reset-password`, {
      method: 'POST',
      body: {
        email: form.value.email,
        token: form.value.token,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation
      }
    })

    success.value = true
  } catch (err: any) {
    console.error('Erreur lors de la réinitialisation:', err)

    const message = err?.data?.message || 'Erreur lors de la réinitialisation'

    if (message.includes('invalide') || message.includes('expiré')) {
      linkInvalid.value = true
    } else {
      error.value = message
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf5ff 0%, #fef7f0 50%, #f5f0eb 100%);
  padding: 2rem;
}

.reset-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(107, 33, 168, 0.15);
  max-width: 450px;
  width: 100%;
  padding: 3rem;
  border: 1px solid rgba(139, 92, 46, 0.1);
}

.reset-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  margin-bottom: 1.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: #d4b128;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reset-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem;
}

.reset-header p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #d4b128;
  background: white;
  box-shadow: 0 0 0 3px rgba(107, 33, 168, 0.1);
}

.form-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #ef4444;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background: #ef4444;
}

.strength-bar.medium::after {
  width: 66%;
  background: #f59e0b;
}

.strength-bar.strong::after {
  width: 100%;
  background: #10b981;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 50px;
}

.strength-bar.weak + .strength-text {
  color: #ef4444;
}

.strength-bar.medium + .strength-text {
  color: #f59e0b;
}

.strength-bar.strong + .strength-text {
  color: #10b981;
}

.field-error {
  color: #ef4444;
  font-size: 0.85rem;
}

.field-success {
  color: #10b981;
  font-size: 0.85rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

.btn-submit {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #d4b128;
  color: white;
  box-shadow: 0 4px 15px rgba(107, 33, 168, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 33, 168, 0.4);
}

.btn-submit:disabled {
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

/* Success Container */
.success-container {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #d4b128;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 25px rgba(107, 33, 168, 0.3);
}

.success-container h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 1rem;
}

.success-container p {
  color: #6b7280;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.btn-login-redirect {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: #d4b128;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 33, 168, 0.3);
}

.btn-login-redirect:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 33, 168, 0.4);
}

/* Error Container */
.error-container {
  text-align: center;
  padding: 2rem 0;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-container h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 1rem;
}

.error-container p {
  color: #6b7280;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.btn-back {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: #6b7280;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #4b5563;
}

/* Footer */
.reset-footer {
  text-align: center;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid;
  border-image: linear-gradient(90deg, #d4b128 0%, #d4b128 100%) 1;
}

.reset-footer p {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .reset-container {
    padding: 2rem 1.5rem;
  }

  .reset-header h1 {
    font-size: 1.5rem;
  }
}
</style>
