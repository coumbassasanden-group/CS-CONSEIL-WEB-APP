<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Animation de succès -->
      <div class="success-animation">
        <div class="check-circle">
          <div class="check-mark">✓</div>
        </div>
        <div class="confetti">
          <div v-for="i in 20" :key="i" class="confetti-piece" :style="getConfettiStyle(i)"></div>
        </div>
      </div>

      <!-- Contenu -->
      <div class="success-content">
        <h1 class="success-title">🎉 Bienvenue chez ALT News !</h1>
        <p class="success-message">
          Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de tous nos contenus exclusifs.
        </p>

        <!-- Résumé de l'abonnement -->
        <div v-if="currentSubscription.isActive" class="subscription-summary">
          <div class="summary-card">
            <div class="summary-header">
              <span class="summary-icon">{{ currentSubscription.plan?.icon }}</span>
              <div>
                <h3>Plan {{ currentSubscription.plan?.name }}</h3>
                <p class="summary-status">
                  <span class="status-badge active">Actif</span>
                </p>
              </div>
            </div>

            <div class="summary-details">
              <div class="detail-row">
                <span class="detail-label">Montant</span>
                <span class="detail-value">
                  {{ formatPrice(currentSubscription.plan?.price || 0) }} 
                  / {{ currentSubscription.plan?.period === 'month' ? 'mois' : 'an' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date de début</span>
                <span class="detail-value">{{ formatDate(currentSubscription.startDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Prochain paiement</span>
                <span class="detail-value">{{ formatDate(currentSubscription.endDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Renouvellement auto.</span>
                <span class="detail-value">
                  <span v-if="currentSubscription.autoRenew" class="badge-success">Activé</span>
                  <span v-else class="badge-warning">Désactivé</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Prochaines étapes -->
        <div class="next-steps">
          <h3>Que faire maintenant ?</h3>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-icon">📧</div>
              <h4>Vérifiez votre email</h4>
              <p>Un email de confirmation avec tous les détails vous a été envoyé.</p>
            </div>
           
            <div class="step-card">
              <div class="step-icon">🔔</div>
              <h4>Activez les notifications</h4>
              <p>Restez informé des dernières actualités en temps réel.</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="success-actions">
          <NuxtLink to="/alt-news" class="btn-primary">
            <span>Découvrir les articles</span>
            <span class="btn-icon">→</span>
          </NuxtLink>
          <button @click="showLoginModal = true" class="btn-secondary" type="button">
            Gérer mon abonnement
          </button>
        </div>

        <!-- Aide -->
        <div class="help-section">
          <p class="help-text">
            Une question ? Notre équipe est là pour vous aider.
          </p>
          <div class="help-links">
            <NuxtLink to="/contact" class="help-link">
              <span class="help-icon">💬</span>
              <span>Contactez-nous</span>
            </NuxtLink>
            <NuxtLink to="/faq" class="help-link">
              <span class="help-icon">❓</span>
              <span>FAQ</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de connexion -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showLoginModal" class="login-modal-overlay" @click.self="showLoginModal = false">
          <div class="login-modal">
            <div class="modal-header">
              <h3>Connexion à votre compte</h3>
              <button class="btn-close" @click="showLoginModal = false" type="button">
                <span>×</span>
              </button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="handleLogin">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    id="email"
                    v-model="loginForm.email"
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
                    v-model="loginForm.password"
                    type="password"
                    placeholder="Votre mot de passe"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group-checkbox">
                  <label class="checkbox-label">
                    <input
                      v-model="loginForm.remember"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <a href="#" class="forgot-link">Mot de passe oublié ?</a>
                </div>

                <div v-if="loginError" class="error-message">
                  {{ loginError }}
                </div>

                <button
                  type="submit"
                  class="btn-login"
                  :disabled="isLoggingIn"
                >
                  <span v-if="isLoggingIn" class="spinner"></span>
                  <span v-else>Se connecter</span>
                </button>
              </form>

              <div class="modal-footer">
                <p>Pas encore de compte ? <a href="/subscriber" class="register-link">S'inscrire</a></p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const {
  currentSubscription,
  formatPrice
} = useSubscription()

// État de la modal de connexion
const showLoginModal = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

// Gestion de la connexion
const handleLogin = async () => {
  loginError.value = ''
  isLoggingIn.value = true

  try {
    // Simulation d'une connexion
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Ici, vous devez implémenter votre logique de connexion réelle
    // Par exemple : const response = await $fetch('/api/auth/login', { ... })

    // Si connexion réussie
    showLoginModal.value = false
    navigateTo('/subscriber/manage')
  } catch (error) {
    loginError.value = 'Email ou mot de passe incorrect'
  } finally {
    isLoggingIn.value = false
  }
}

// Redirection si pas d'abonnement actif
onMounted(() => {
  if (!currentSubscription.value.isActive) {
    // En production, rediriger vers la page d'abonnement
    // navigateTo('/subscriber')
  }
})

// Formatage de date
const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Style des confettis
const getConfettiStyle = (index: number) => {
  const colors = ['#8B5C2E', '#A67C52', '#C19A6B', '#f59e0b', '#10b981']
  const randomColor = colors[index % colors.length]
  const randomDelay = Math.random() * 0.5
  const randomLeft = Math.random() * 100
  
  return {
    backgroundColor: randomColor,
    left: `${randomLeft}%`,
    animationDelay: `${randomDelay}s`
  }
}

// SEO
useHead({
  title: 'Abonnement confirmé - ALT News',
  meta: [
    { name: 'description', content: 'Votre abonnement ALT News a été confirmé avec succès.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cs-light-brown-color) 0%, #fef7f0 50%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  max-width: 800px;
  width: 100%;
}

/* Animation de succès */
.success-animation {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.check-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
  animation: bounceIn 0.6s ease;
  position: relative;
  z-index: 2;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.check-mark {
  font-size: 4rem;
  color: white;
  font-weight: bold;
  animation: checkPop 0.5s ease 0.3s;
  animation-fill-mode: both;
}

@keyframes checkPop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: visible;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: 50%;
  border-radius: 2px;
  animation: confettiFall 2s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(400px) rotate(720deg);
  }
}

/* Contenu */
.success-content {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.2rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Résumé */
.subscription-summary {
  margin-bottom: 3rem;
}

.summary-card {
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #f5d7b8;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.summary-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cs-brown-color);
  margin: 0 0 0.5rem;
}

.summary-status {
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.summary-details {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-weight: 700;
  color: #1f2937;
}

.badge-success {
  padding: 0.25rem 0.75rem;
  background: #d1fae5;
  color: #059669;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-warning {
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #d97706;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Prochaines étapes */
.next-steps {
  margin-bottom: 3rem;
}

.next-steps h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.step-card {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
}

.step-card:hover {
  transform: translateY(-5px);
}

.step-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.step-card h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-card p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Actions */
.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(5px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Aide */
.help-section {
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.help-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.help-links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cs-brown-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.help-link:hover {
  opacity: 0.8;
}

.help-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .success-page {
    padding: 1rem;
  }

  .success-content {
    padding: 2rem 1.5rem;
  }

  .success-title {
    font-size: 2rem;
  }

  .success-message {
    font-size: 1.1rem;
  }

  .check-circle {
    width: 100px;
    height: 100px;
  }

  .check-mark {
    font-size: 3rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .success-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .summary-header {
    flex-direction: column;
    text-align: center;
  }
}

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
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
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
</style>
