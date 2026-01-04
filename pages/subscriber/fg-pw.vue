<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <!-- Header -->
      <div class="page-header">
        <NuxtLink to="/" class="btn-back">
          ← Retour à l'accueil
        </NuxtLink>
      </div>

      <!-- Main Card -->
      <div class="forgot-password-card">
        <!-- Logo/Brand -->
        <div class="card-header">
          <h1 class="logo-text">CS-CONSEIL</h1>
          <p class="logo-subtitle">Réinitialiser votre mot de passe</p>
        </div>

        <!-- Form Section -->
        <div class="card-body">
          <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
            <div class="form-title-section">
              <h2>Récupérez l'accès à votre compte</h2>
              <p class="form-description">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <!-- Email Input -->
            <div class="form-group">
              <label for="email">Adresse email *</label>
              <input
                id="email"
                v-model="forgotForm.email"
                type="email"
                placeholder="votre@email.com"
                required
                class="form-input"
                :disabled="isLoading || forgotSuccess"
              />
              <small class="form-hint">
                Nous vérifierons cette adresse dans notre base de données
              </small>
            </div>

            <!-- Error Message -->
            <div v-if="forgotError" class="error-message">
              <span class="error-icon">⚠️</span>
              {{ forgotError }}
            </div>

            <!-- Success Message -->
            <div v-if="forgotSuccess" class="success-message">
              <span class="success-icon">✓</span>
              <div class="success-content">
                <strong>Vérifiez votre email !</strong>
                <p>Un lien de réinitialisation a été envoyé à <strong>{{ forgotForm.email }}</strong></p>
                <p class="success-hint">Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || forgotSuccess"
            >
              <span v-if="isLoading" class="spinner"></span>
              <span v-else-if="forgotSuccess">Email envoyé ✓</span>
              <span v-else>Envoyer le lien de réinitialisation</span>
            </button>

            <!-- Back to Login Link -->
            <div class="form-footer">
              <p>
                Vous vous souvenez de votre mot de passe ?
                <NuxtLink to="/login" class="login-link">Se connecter</NuxtLink>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-section">
        <div class="info-box">
          <h3>ℹ️ Besoin d'aide ?</h3>
          <ul>
            <li>Vérifiez que vous avez entré le bon email</li>
            <li>Consultez votre dossier "Spam" ou "Promotions"</li>
            <li>Contactez-nous à <a href="mailto:support@cs-conseil.com">support@cs-conseil.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// État - Mot de passe oublié
const isLoading = ref(false)
const forgotError = ref('')
const forgotSuccess = ref(false)
const forgotForm = ref({
  email: ''
})

/**
 * Gérer la demande de réinitialisation de mot de passe
 * Appel API à: https://altnews-sub.altdigit.africa/auth/forgot-password (ou équivalent)
 */
const handleForgotPassword = async () => {
  forgotError.value = ''
  isLoading.value = true

  try {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiSubcriptionBaseUrl

    console.log('📧 Demande de réinitialisation pour:', forgotForm.value.email)

    // Appel API réel
    const response = await $fetch(`${apiUrl}/auth/forgot-password`, {
      method: 'POST',
      body: {
        email: forgotForm.value.email
      }
    })

    console.log('✅ Email de réinitialisation envoyé à:', forgotForm.value.email)
    console.log('� Réponse API:', response)
    
    // Afficher le message de succès
    forgotSuccess.value = true

    // Redirection automatique après 4 secondes
    setTimeout(() => {
      resetForm()
      navigateTo('/login')
    }, 4000)
  } catch (err: any) {
    console.error('❌ Erreur lors de la demande de réinitialisation:', err)
    forgotError.value = err?.data?.message || err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Réinitialiser le formulaire
 */
const resetForm = () => {
  forgotForm.value = {
    email: ''
  }
  forgotError.value = ''
  forgotSuccess.value = false
}
</script>

<style scoped>
/* ========== PAGE LAYOUT ========== */
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
}

.forgot-password-container {
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
.forgot-password-card {
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
