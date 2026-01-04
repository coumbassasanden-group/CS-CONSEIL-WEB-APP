<template>
  <div class="new-password-page">
    <div class="new-password-container">
     
      <!-- Main Card -->
      <div class="new-password-card">
        <!-- Error State - Invalid URL -->
        <div v-if="!isValidUrl" class="invalid-url-state">
          <div class="error-state-icon">⚠️</div>
          <h2>Lien invalide ou expiré</h2>
          <p>
            Le lien de réinitialisation semble être invalide ou a expiré.
            <br/>Veuillez demander un nouveau lien de réinitialisation.
          </p>
          <NuxtLink to="/subscriber/fg-pw" class="btn-request-new">
            Demander un nouveau lien
          </NuxtLink>
        </div>

        <!-- Valid Form Section -->
        <div v-else class="card-body">
          <form @submit.prevent="handleSetNewPassword" class="new-password-form">
            <div class="form-title-section">
              <h2>Créez un nouveau mot de passe</h2>
              <p class="form-description">
                Entrez votre code de réinitialisation et créez un nouveau mot de passe sécurisé.
              </p>
            </div>

            <!-- Reset Code Input -->
            <div class="form-group">
              <label for="reset-code">Code de réinitialisation *</label>
              <input
                id="reset-code"
                v-model="newPasswordForm.resetCode"
                type="text"
                placeholder="Entrez le code reçu par email"
                required
                class="form-input"
                :disabled="isLoading || resetSuccess"
              />
              <small class="form-hint">
                Le code se trouve dans l'email de réinitialisation
              </small>
            </div>

            <!-- New Password Input -->
            <div class="form-group">
              <label for="new-password">Nouveau mot de passe *</label>
              <input
                id="new-password"
                v-model="newPasswordForm.password"
                type="password"
                placeholder="Minimum 8 caractères"
                required
                minlength="8"
                class="form-input"
                :disabled="isLoading || resetSuccess"
              />
              <small class="form-hint">
                Choisissez un mot de passe sécurisé (min 8 caractères)
              </small>
            </div>

            <!-- Confirm Password Input -->
            <div class="form-group">
              <label for="confirm-password">Confirmer le mot de passe *</label>
              <input
                id="confirm-password"
                v-model="newPasswordForm.confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                required
                minlength="8"
                class="form-input"
                :disabled="isLoading || resetSuccess"
              />
              <small class="form-hint">
                Doit être identique au mot de passe ci-dessus
              </small>
            </div>

            <!-- Password Requirements -->
            <div class="password-requirements">
              <p class="requirements-title">Exigences du mot de passe :</p>
              <ul>
                <li :class="{ met: passwordMet.length }">Au moins 8 caractères</li>
                <li :class="{ met: passwordMet.uppercase }">Une lettre majuscule</li>
                <li :class="{ met: passwordMet.lowercase }">Une lettre minuscule</li>
                <li :class="{ met: passwordMet.number }">Un chiffre</li>
              </ul>
            </div>

            <!-- Error Message -->
            <div v-if="resetError" class="error-message">
              <span class="error-icon">⚠️</span>
              {{ resetError }}
            </div>

            <!-- Success Message -->
            <div v-if="resetSuccess" class="success-message">
              <span class="success-icon">✓</span>
              <div class="success-content">
                <strong>Mot de passe mis à jour !</strong>
                <p>Votre mot de passe a été réinitialisé avec succès.</p>
                <p class="success-hint">Redirection vers la connexion...</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || resetSuccess || !isPasswordValid || newPasswordForm.password !== newPasswordForm.confirmPassword"
            >
              <span v-if="isLoading" class="spinner"></span>
              <span v-else-if="resetSuccess">Mot de passe mis à jour ✓</span>
              <span v-else>Créer un nouveau mot de passe</span>
            </button>

            <!-- Back to Login Link -->
            <div class="form-footer">
              <p>
                Vous vous souvenez de votre mot de passe ?
                <NuxtLink to="/en/alt-news" class="login-link">Se connecter</NuxtLink>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-section">
        <div class="info-box">
          <h3>ℹ️ Conseils de sécurité</h3>
          <ul>
            <li>N'utilisez pas un mot de passe utilisé ailleurs</li>
            <li>Incluez des majuscules, minuscules, chiffres et caractères spéciaux</li>
            <li>Évitez votre nom, email ou informations personnelles</li>
            <li>Mémorisez votre mot de passe ou utilisez un gestionnaire</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter();
const route = useRoute()
const config = useRuntimeConfig();

// État - Nouveau mot de passe
const isLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref(false)
const isValidUrl = ref(true)

const localePath = useLocalePath();

// Vérifier les paramètres de l'URL au montage
onMounted(() => {
  const token = route.query.token
  const userId = route.query.userId

  // Si l'un des paramètres manque, afficher le message d'erreur
  if (!token || !userId) {
    isValidUrl.value = false
    console.warn('⚠️ Paramètres manquants dans l\'URL: token ou userId')
  } else {
    isValidUrl.value = true
    console.log('✅ URL valide - token et userId présents')
  }
})


const newPasswordForm = ref({
  resetCode: '',
  password: '',
  confirmPassword: ''
})

async function handleSetNewPassword() {
  resetError.value = ''
  
  // Validation des mots de passe
  if (newPasswordForm.value.password !== newPasswordForm.value.confirmPassword) {
    resetError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (!isPasswordValid.value) {
    resetError.value = 'Le mot de passe ne respecte pas toutes les exigences'
    return
  }

  if (!newPasswordForm.value.resetCode) {
    resetError.value = 'Veuillez entrer le code de réinitialisation'
    return
  }

  isLoading.value = true

  try {
    const apiUrl = config.public.apiSubcriptionUrl 

    console.log('🔐 Demande de mise à jour du mot de passe avec code:', newPasswordForm.value.resetCode)

    // Appel API réel
    const response = await $fetch(`${apiUrl}auth/change-password`, {
      method: 'PUT',
      body: {
        verificationCode: newPasswordForm.value.resetCode,
        newPassword: newPasswordForm.value.password,
        userId: "123344"
      }
    })

    console.log('✅ Mot de passe mis à jour avec succès:', response)
    
    // Afficher le message de succès
    resetSuccess.value = true

    // Redirection automatique après 3 secondes
    setTimeout(() => {
      resetForm()
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    console.error('❌ Erreur lors de la mise à jour du mot de passe:', err)
    resetError.value =  'Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}

// Validation du mot de passe
const passwordMet = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false
})

/**
 * Vérifier la validité du mot de passe
 */
const isPasswordValid = computed(() => {
  return (
    passwordMet.value.length &&
    passwordMet.value.uppercase &&
    passwordMet.value.lowercase &&
    passwordMet.value.number
  )
})

/**
 * Watcher pour mettre à jour les exigences du mot de passe
 */
watch(
  () => newPasswordForm.value.password,
  (password) => {
    passwordMet.value.length = password.length >= 8
    passwordMet.value.uppercase = /[A-Z]/.test(password)
    passwordMet.value.lowercase = /[a-z]/.test(password)
    passwordMet.value.number = /\d/.test(password)
  }
)

/**
 * Réinitialiser le formulaire
 */
const resetForm = () => {
  newPasswordForm.value = {
    resetCode: '',
    password: '',
    confirmPassword: ''
  }
  resetError.value = ''
  resetSuccess.value = false
}
</script>

<style scoped>
/* ========== PAGE LAYOUT ========== */
.new-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
}

.new-password-container {
  width: 100%;
  max-width: 500px;
}

/* ========== PAGE HEADER ========== */
.page-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cs-brown-color, #8b5c2e);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.7);
}

.btn-back:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(139, 92, 46, 0.1);
}

/* ========== MAIN CARD ========== */
.new-password-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* ========== CARD HEADER ========== */
.card-header {
  background: linear-gradient(135deg, #8b5c2e 0%, #6b4423 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.95;
}

/* ========== CARD BODY ========== */
.card-body {
  padding: 2rem;
}

.forgot-password-form {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== FORM TITLE SECTION ========== */
.form-title-section {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.form-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

/* ========== FORM GROUP ========== */
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
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--cs-brown-color, #8b5c2e);
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 46, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

/* ========== ERROR MESSAGE ========== */
.error-message {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* ========== SUCCESS MESSAGE ========== */
.success-message {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.success-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.success-content {
  flex: 1;
}

.success-content strong {
  font-weight: 700;
  display: block;
  margin-bottom: 0.375rem;
}

.success-content p {
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
}

.success-hint {
  font-size: 0.85rem !important;
  color: #166534 !important;
  margin-top: 0.5rem !important;
  opacity: 0.9;
}

/* ========== SUBMIT BUTTON ========== */
.btn-submit {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #8b5c2e 0%, #6b4423 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.95;
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

/* ========== FORM FOOTER ========== */
.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-footer p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.login-link {
  color: var(--cs-brown-color, #8b5c2e);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.login-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* ========== INFO SECTION ========== */
.info-section {
  margin-top: 2rem;
}

.info-box {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--cs-brown-color, #8b5c2e);
}

.info-box h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.info-box li:last-child {
  margin-bottom: 0;
}

.info-box li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--cs-brown-color, #8b5c2e);
  font-weight: 700;
}

.info-box a {
  color: var(--cs-brown-color, #8b5c2e);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.info-box a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* ========== PASSWORD REQUIREMENTS ========== */
.password-requirements {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.requirements-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.password-requirements li {
  font-size: 0.85rem;
  color: #6b7280;
  padding-left: 1.75rem;
  position: relative;
  transition: color 0.2s ease;
}

.password-requirements li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #d1d5db;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.password-requirements li.met {
  color: #16a34a;
  font-weight: 600;
}

.password-requirements li.met::before {
  content: '✓';
  color: #16a34a;
  font-size: 1rem;
}

/* ========== INVALID URL STATE ========== */
.invalid-url-state {
  padding: 3rem 2rem;
  text-align: center;
}

.error-state-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  display: block;
}

.invalid-url-state h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 0.75rem 0;
}

.invalid-url-state p {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.btn-request-new {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5c2e 0%, #6b4423 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-request-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.95;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .forgot-password-page {
    padding: 1rem;
  }

  .forgot-password-container {
    max-width: 100%;
  }

  .card-header {
    padding: 2rem 1.5rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-title-section h2 {
    font-size: 1.3rem;
  }

  .btn-submit {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  .info-box {
    padding: 1rem;
  }

  .info-box h3 {
    font-size: 0.95rem;
  }

  .info-box li {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1.5rem;
  }

  .card-header {
    padding: 1.5rem 1rem;
  }

  .logo-text {
    font-size: 1.3rem;
  }

  .logo-subtitle {
    font-size: 0.9rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .form-title-section {
    margin-bottom: 1.5rem;
  }

  .form-title-section h2 {
    font-size: 1.2rem;
  }

  .form-description {
    font-size: 0.85rem;
  }
}
</style>
