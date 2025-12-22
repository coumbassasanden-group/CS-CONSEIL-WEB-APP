<template>
  <div class="manage-page">
    <div class="container">
      <div class="page-header">
        <NuxtLink to="/" class="back-link">
          <span>←</span>
          <span>Retour</span>
        </NuxtLink>
        <h1 class="page-title">Mon abonnement</h1>
        <p class="page-subtitle">Gérez votre abonnement et accédez à vos articles ALT News</p>
      </div>

      <div v-if="isLoading" class="loading-page">
        <div class="spinner-large"></div>
        <p>Chargement de votre profil...</p>
      </div>

      <div v-else-if="subscriptionData.isActive" class="subscription-content">
        <!-- User Info Section -->
        <div class="user-info-section">
          <div class="user-info-card">
            <div class="user-header">
              <div class="user-avatar">
                {{ getAuthUser()?.firstName?.charAt(0) }}{{ getAuthUser()?.lastName?.charAt(0) }}
              </div>
              <div class="user-details">
                <h3 class="user-name">{{ getAuthUser()?.firstName }} {{ getAuthUser()?.lastName }}</h3>
                <p class="user-email">{{ getAuthUser()?.email }}</p>
                <span class="user-status">Abonné depuis le {{ formatDate(subscriptionData.startDate) }}</span>
              </div>
            </div>
            <div style="color: white !important" class="user-meta">
              <div class="meta-item">
                <span class="meta-icon">
                   <Icon icon="line-md:phone-filled" />
                </span>
                <div>
                  <p class="meta-label">Téléphone</p>
                  <p class="meta-value">{{ getAuthUser()?.phone || 'Non fourni' }}</p>
                </div>
              </div>
              <!-- <div class="meta-item">
                <span class="meta-icon">
                  <Icon icon="mdi:user" />
                </span>
                <div >
                  <p class="meta-label">Rôle</p>
                  <p class="meta-value">{{ getAuthUser()?.role || 'Abonné' }}</p>
                </div>
              </div> -->
              <div class="meta-item">
                <span class="meta-icon">✅</span>
                <div>
                  <p class="meta-label">Statut</p>
                  <p class="meta-value">{{ getAuthUser()?.isActive ? 'Actif' : 'Inactif' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="main-grid">
          <div class="info-card">
            <div class="card-header">
              <div class="header-left">
                <span class="plan-icon">
                  <Icon icon="marketeq:gold-medal" />
                  {{ subscriptionData.plan?.icon }}
                </span>
                <div>
                  <h2>Plan {{ subscriptionData.plan?.name }}</h2>
                  <p class="plan-description">Abonnement actif</p>
                </div>
              </div>
              <span class="status-badge active">Actif</span>
            </div>

            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label"> <Icon icon="mdi:currency-usd" /> Montant</span>
                  <span class="info-value">
                    {{ formatPrice(subscriptionData.plan?.price || 0, subscriptionData.plan?.currency) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label"><Icon icon="mdi:calendar" /> Date de début</span>
                  <span class="info-value">{{ formatDate(subscriptionData.startDate) }}</span>
                </div>
                <div v-if="subscriptionData.plan?.duration > 0" class="info-item">
                  <span class="info-label"><Icon icon="mdi:calendar-clock" /> Prochain paiement</span>
                  <span class="info-value">{{ formatDate(subscriptionData.endDate) }}</span>
                </div>
                <!-- <div v-if="subscriptionData.plan?.duration > 0" class="info-item">
                  <span class="info-label">⚙️ Renouvellement</span>
                  <span class="info-value">
                    <span v-if="subscriptionData.autoRenew" class="badge-success">Automatique</span>
                    <span v-else class="badge-warning">Désactivé</span>
                  </span>
                </div> -->
              </div>
            </div>

            <div class="card-footer">
              <h3 class="features-title">Avantage(s):</h3>
              <ul class="features-list">
                <li v-for="(feature, index) in subscriptionData.plan?.features" :key="index">
                  <span class="check-icon">✓</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <div class="renewal-section">
              <button 
                v-if="!subscriptionData.autoRenew" 
                @click="handleRenewSubscription" 
                class="btn-renew"
                :disabled="isRenewing"
              >
                <span v-if="isRenewing" class="spinner"></span>
                <span v-else>🔄 Renouveler l'abonnement</span>
              </button>
              <button 
                v-if="subscriptionData.plan?.period > 0"
                @click="handleToggleAutoRenew" 
                class="btn-toggle-renew"
                :disabled="isTogglingRenew"
              >
                <span v-if="isTogglingRenew" class="spinner"></span>
                <span v-else>⚙️ Désactiver le renouvellement automatique</span>
              </button>
            </div>
          </div>

          <div style="display: none;" class="quick-actions">
            <h3>Actions rapides</h3>
            <div class="actions-list">
              <button class="action-btn" @click="showUpgradeModal = true">
                <span class="action-icon">⬆️</span>
                <span>Changer de plan</span>
              </button>
              <button class="action-btn" @click="showPaymentModal = true">
                <span class="action-icon">💳</span>
                <span>Moyen de paiement</span>
              </button>
              <button class="action-btn" @click="showInvoiceModal = true">
                <span class="action-icon">📄</span>
                <span>Factures</span>
              </button>
              <button class="action-btn danger" @click="showCancelModal = true">
                <span class="action-icon">⚠️</span>
                <span>Annuler</span>
              </button>
            </div>
          </div>
        </div>

        <div class="articles-section">
          <div class="section-header">
            <h2>Les éditions ALT News</h2>
            <p>Éditions disponibles avec votre abonnement {{ subscriptionData.plan?.name }}</p>
          </div>

          <div v-if="isLoadingArticles" class="loading-state">
            <div class="spinner-large"></div>
            <p>Chargement de vos articles...</p>
          </div>
          <!-- v-else-if="userArticles.length === 0" -->
          <div  class="empty-articles">
            <span class="empty-icon"></span>
            <h3>Aucune édition disponible pour le moment</h3>
            <p>Les prochaines éditions seront disponibles bientôt ici.</p>
          </div>

          <!-- <div v-else class="articles-grid">
            <div 
              v-for="article in userArticles" 
              :key="article.id"
              class="article-card"
            >
              <div class="article-image">
                <img :src="article.coverImage" :alt="article.title" />
                <span class="article-badge">{{ article.type }}</span>
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="article-date">📅 {{ article.date }}</span>
                  <span class="article-status" :class="article.status">
                    {{ article.status === 'available' ? 'Disponible' : 'À venir' }}
                  </span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                <div class="article-actions">
                  <button 
                    v-if="article.status === 'available'" 
                    @click="downloadArticle(article.id)"
                    class="btn-download"
                    :disabled="downloadingId === article.id"
                  >
                    <span v-if="downloadingId === article.id" class="spinner-small"></span>
                    <span v-else>📥 Télécharger PDF</span>
                  </button>
                  <button 
                    v-else
                    class="btn-coming-soon"
                    disabled
                  >
                    🕐 Bientôt disponible
                  </button>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>

      <div v-else class="no-subscription">
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <h2>Aucun abonnement actif</h2>
          <p>Vous n'avez pas encore d'abonnement ALT News</p>
          <NuxtLink to="/subscriber" class="btn-primary">
            Découvrir nos offres
          </NuxtLink>
        </div>
      </div>
    </div>

    <PaymentAlert
      :is-visible="showCancelModal"
      type="warning"
      title="Annuler l'abonnement"
      message="Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l'accès à tous les contenus premium."
      @close="showCancelModal = false"
      @confirm="handleCancelSubscription"
    />

    <PaymentAlert
      :is-visible="showUpgradeModal"
      type="processing"
      title="Changer de plan"
      message="Choisissez un nouveau plan pour accéder à plus de fonctionnalités."
      @close="showUpgradeModal = false"
      @confirm="navigateTo('/subscriber')"
    />

    <PaymentAlert
      :is-visible="showPaymentModal"
      type="success"
      title="Moyen de paiement"
      message="Cette fonctionnalité sera bientôt disponible."
      @close="showPaymentModal = false"
    />

    <PaymentAlert
      :is-visible="showInvoiceModal"
      type="success"
      title="Factures"
      message="Vos factures seront disponibles ici prochainement."
      @close="showInvoiceModal = false"
    />

    <PaymentAlert
      :is-visible="showSuccessModal"
      type="success"
      :title="successMessage.title"
      :message="successMessage.message"
      @close="showSuccessModal = false"
      @confirm="showSuccessModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSubscription } from '~/composables/useSubscription'
import { useAuth } from '~/composables/useAuth'
import { useRoute, navigateTo } from '#app'
import { Icon } from "@iconify/vue";


// Appliquer le middleware d'authentification
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const {
  currentSubscription,
  formatPrice,
  cancelSubscription
} = useSubscription()

const { isLoggedIn, getAuthUser } = useAuth()

const showCancelModal = ref(false)
const showUpgradeModal = ref(false)
const showPaymentModal = ref(false)
const showInvoiceModal = ref(false)
const showSuccessModal = ref(false)
const successMessage = ref({ title: '', message: '' })
const isRenewing = ref(false)
const isTogglingRenew = ref(false)
const isLoadingArticles = ref(true)
const downloadingId = ref<number | null>(null)
const isLoading = ref(true)

const userArticles = ref([
  {
    id: 1,
    title: 'ALT News - Édition Décembre 2025',
    excerpt: 'Découvrez les analyses et reportages du mois de décembre : économie, politique, société et culture.',
    coverImage: '/assets/img/blog/blog-1.jpg',
    date: '15 Décembre 2025',
    type: 'Mensuel',
    status: 'available',
    pdfUrl: '/downloads/alt-news-dec-2025.pdf'
  },
  {
    id: 2,
    title: 'ALT News - Édition Novembre 2025',
    excerpt: 'Retour sur les événements marquants de novembre avec nos experts et correspondants.',
    coverImage: '/assets/img/blog/blog-2.jpg',
    date: '15 Novembre 2025',
    type: 'Mensuel',
    status: 'available',
    pdfUrl: '/downloads/alt-news-nov-2025.pdf'
  },
  {
    id: 3,
    title: 'ALT News - Édition Octobre 2025',
    excerpt: 'Les dossiers exclusifs du mois : innovation technologique, enjeux climatiques et perspectives économiques.',
    coverImage: '/assets/img/blog/blog-3.jpg',
    date: '15 Octobre 2025',
    type: 'Mensuel',
    status: 'available',
    pdfUrl: '/downloads/alt-news-oct-2025.pdf'
  },
  {
    id: 4,
    title: 'ALT News - Édition Janvier 2026',
    excerpt: 'Prochaine édition : analyses prospectives pour l\'année 2026.',
    coverImage: '/assets/img/blog/blog-4.jpg',
    date: '15 Janvier 2026',
    type: 'Mensuel',
    status: 'coming',
    pdfUrl: ''
  }
])

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Charger les données d'abonnement depuis localStorage
const subscriptionData = ref<any>({
  isActive: true, // Commencer par true pour afficher le contenu
  plan: null,
  startDate: new Date(),
  endDate: null,
  autoRenew: true
})

onMounted(() => {
  isLoading.value = true
  
  // Vérifier la connexion
  if (!isLoggedIn()) {
    console.warn('Utilisateur non connecté, redirection vers success page')
    navigateTo('/' + (route.params.locale || 'fr') + '/subscriber/success')
    isLoading.value = false
    return
  }

  // Charger le plan depuis localStorage
  const savedPlan = localStorage.getItem('selectedPlan')
  if (savedPlan) {
    try {
      const plan = JSON.parse(savedPlan)
      subscriptionData.value.plan = plan
      subscriptionData.value.isActive = true
      subscriptionData.value.startDate = new Date()
      
      // Calculer la date de fin
      if (plan.duration) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + plan.duration)
        subscriptionData.value.endDate = endDate
      }
    } catch (e) {
      console.error('Erreur lors du chargement du plan:', e)
      subscriptionData.value.isActive = false
    }
  } else {
    console.warn('Aucun plan trouvé dans localStorage')
    subscriptionData.value.isActive = false
  }

  // Simuler le chargement des articles
  isLoadingArticles.value = false
  isLoading.value = false
})

const handleRenewSubscription = async () => {
  isRenewing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    subscriptionData.value.autoRenew = true
    subscriptionData.value.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    successMessage.value = {
      title: 'Renouvellement réussi !',
      message: 'Votre abonnement a été renouvelé avec succès. Le renouvellement automatique est maintenant activé.'
    }
    showSuccessModal.value = true
  } catch (error) {
    console.error('Erreur lors du renouvellement:', error)
  } finally {
    isRenewing.value = false
  }
}

const handleToggleAutoRenew = async () => {
  isTogglingRenew.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    subscriptionData.value.autoRenew = !subscriptionData.value.autoRenew
    
    successMessage.value = {
      title: subscriptionData.value.autoRenew ? 'Renouvellement activé' : 'Renouvellement désactivé',
      message: subscriptionData.value.autoRenew 
        ? 'Le renouvellement automatique de votre abonnement est maintenant activé.'
        : 'Le renouvellement automatique de votre abonnement est maintenant désactivé.'
    }
    showSuccessModal.value = true
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    isTogglingRenew.value = false
  }
}

const downloadArticle = async (articleId: number) => {
  try {
    console.log('Téléchargement de l\'article:', articleId)
    // Simuler le téléchargement
    await new Promise(resolve => setTimeout(resolve, 1500))
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const handleCancelSubscription = async () => {
  if (!window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
    return
  }

  isRenewing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    subscriptionData.value.isActive = false
    
    successMessage.value = {
      title: 'Abonnement annulé',
      message: 'Votre abonnement a été annulé avec succès. Vous pouvez toujours accéder aux articles jusqu\'à la fin de votre période actuelle.'
    }
    showSuccessModal.value = true
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error)
  } finally {
    isRenewing.value = false
  }
}



onMounted(() => {
  setTimeout(() => {
    isLoadingArticles.value = false
  }, 1000)
})

useHead({
  title: 'Gérer mon abonnement - ALT News',
  meta: [
    { name: 'description', content: 'Gérez votre abonnement ALT News, renouvelez votre plan et accédez à vos articles.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.manage-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cs-light-brown-color) 0%, #fef7f0 50%, #ffffff 100%);
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  margin-bottom: 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cs-brown-color);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

.subscription-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* User Info Section Styles */
.user-info-section {
  margin-bottom: 1rem;
}

.user-info-card {
  background: linear-gradient(135deg, var(--cs-brown-color) 0%, #a86a40 100%);
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  box-shadow: 0 8px 30px rgba(139, 92, 46, 0.3);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.4);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-email {
  font-size: 1.05rem;
  margin: 0 0 0.75rem 0;
  opacity: 0.95;
}

.user-status {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.user-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.meta-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.meta-label {
  font-size: 0.8rem;
  opacity: 0.85;
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}

.meta-value {
  font-size: 1.1rem;
  margin: 0.25rem 0 0 0;
  font-weight: 700;
  color: white;
}

/* Ensure all text in user info section is white */
.user-info-card {
  color: white;
}

.user-info-card * {
  color: white;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.info-card,
.quick-actions {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.plan-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cs-brown-color);
  margin: 0 0 0.25rem;
}

.plan-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.status-badge {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

.info-value {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 700;
}

.badge-success {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #d1fae5;
  color: #059669;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-warning {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #d97706;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.card-footer {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.features-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #d1fae5;
  color: #059669;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.renewal-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-renew,
.btn-toggle-renew {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-renew {
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-renew:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-toggle-renew {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-toggle-renew:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-renew:disabled,
.btn-toggle-renew:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-actions h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.action-btn:hover {
  border-color: var(--cs-brown-color);
  background: #fef7f0;
  transform: translateX(5px);
}

.action-btn.danger:hover {
  border-color: #ef4444;
  background: #fee2e2;
}

.action-icon {
  font-size: 1.5rem;
}

.articles-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #6b7280;
  font-size: 1.05rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(139, 92, 46, 0.2);
  border-top-color: var(--cs-brown-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}

.loading-state p {
  color: #6b7280;
  font-size: 1.1rem;
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

.empty-articles p {
  color: #6b7280;
  font-size: 1.05rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.article-card {
  background: #f9fafb;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid #e5e7eb;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: var(--cs-brown-color);
}

.article-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  background: var(--cs-brown-color);
  color: white;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.article-content {
  padding: 1.5rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.article-date {
  color: #6b7280;
}

.article-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
}

.article-status.available {
  background: #d1fae5;
  color: #059669;
}

.article-status.coming {
  background: #fef3c7;
  color: #d97706;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-excerpt {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.article-actions {
  display: flex;
  gap: 1rem;
}

.btn-download,
.btn-coming-soon {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-download {
  background: var(--cs-brown-color);
  color: white;
}

.btn-download:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-coming-soon {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.spinner,
.spinner-small {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner {
  width: 20px;
  height: 20px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-subscription {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  background: white;
  padding: 4rem 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: var(--cs-brown-color);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .manage-page {
    padding: 2rem 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-left {
    width: 100%;
  }

  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-avatar {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .user-meta {
    grid-template-columns: 1fr;
  }
}

/* Loading page styles */
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  gap: 2rem;
}

.loading-page p {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}
</style>
