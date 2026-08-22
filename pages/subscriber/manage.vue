<template>
  <div class="manage-page">
    <!-- Toast Notification -->
    <SubscriberToast :toast="toast" @close="toast.visible = false" />

    <!-- Bandeau de recette : cette page encaisse 100 F au lieu du tarif réel. -->
    <div v-if="modeTest" class="bandeau-recette">
      <strong>Mode recette</strong> — tous les paiements de cette page sont ramenés à
      <strong>100 FCFA</strong> au lieu du tarif réel. Les débits sont bien réels.
      Ne pas communiquer cette adresse aux clients.
    </div>

    <div class="container">
      <div class="page-header">
        <div class="header-top">
          <NuxtLink :to="`/${currentLocale}`" class="back-link">
            <span>&larr;</span>
            <span>Retour</span>
          </NuxtLink>
          <button @click="handleLogout" class="btn-logout">
            <Icon icon="mdi:logout" />
            <span>Déconnexion</span>
          </button>
        </div>
        <h1 class="page-title">Mon espace abonné</h1>
        <p class="page-subtitle">Gérez votre abonnement et accédez à vos éditions ALT News</p>
      </div>

      <div v-if="isLoading" class="loading-page">
        <div class="spinner-large"></div>
        <p>Chargement de votre profil...</p>
      </div>

      <div v-else class="subscription-content">
        <!-- User Info Section -->
        <SubscriberUserInfo
          v-if="subscriptionData.isActive"
          :user="getAuthUser()"
          :start-date="subscriptionData.startDate"
          :plan-name="subscriptionData.plan?.name"
          :is-active="subscriptionData.isActive"
          :format-date="formatDate"
        />

        <!-- Alerte expiration -->
        <SubscriberExpirationAlert
          v-if="isExpirationSoon"
          :days-until-expiration="daysUntilExpiration!"
          :renew-link="`/${currentLocale}/alt-news`"
        />

        <!-- Plan Info Card -->
        <SubscriberPlanCard
          v-if="subscriptionData.plan"
          :plan="subscriptionData.plan"
          :is-active="subscriptionData.isActive"
          :start-date="subscriptionData.startDate"
          :end-date="subscriptionData.endDate"
          :is-expiration-soon="isExpirationSoon"
          :days-until-expiration="daysUntilExpiration"
          :can-access-premium="canAccessPremium"
          :subscriber-link="`/${currentLocale}/alt-news`"
          :plan-description="getPlanDescription()"
          :format-date="formatDate"
          :format-price="formatPriceDisplay"
          @cancel="handleCancelSubscription"
          @upgrade="showUpgradeModal = true"
        />

        <!-- Navigation Tabs -->
        <SubscriberTabs
          :tabs="availableTabs"
          v-model:active-tab="activeTab"
        />

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Profil -->
          <div v-if="activeTab === 'profile'" class="profile-tab">
            <div class="profile-card">
              <div class="profile-header">
                <div class="profile-avatar">
                  {{ getAuthUser()?.firstName?.charAt(0) }}{{ getAuthUser()?.lastName?.charAt(0) }}
                </div>
                <div class="profile-info">
                  <h2>{{ getAuthUser()?.firstName }} {{ getAuthUser()?.lastName }}</h2>
                  <p class="profile-email">{{ getAuthUser()?.email }}</p>
                </div>
              </div>

              <div class="profile-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <Icon icon="mdi:email" class="detail-icon" />
                    <div>
                      <span class="detail-label">Email</span>
                      <span class="detail-value">{{ getAuthUser()?.email }}</span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <Icon icon="mdi:phone" class="detail-icon" />
                    <div>
                      <span class="detail-label">Téléphone</span>
                      <span class="detail-value">{{ getAuthUser()?.phone || 'Non renseigné' }}</span>
                    </div>
                  </div>
                </div>
                <div class="detail-row">
                  <div class="detail-item">
                    <Icon icon="mdi:card-account-details" class="detail-icon" />
                    <div>
                      <span class="detail-label">Plan actuel</span>
                      <span class="detail-value plan-badge" :class="subscriptionData.plan?.type">
                        {{ subscriptionData.plan?.name || 'Gratuit' }}
                      </span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <Icon icon="mdi:calendar" class="detail-icon" />
                    <div>
                      <span class="detail-label">Membre depuis</span>
                      <span class="detail-value">{{ formatDate(subscriptionData.startDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="subscriptionData.plan?.type === 'free'" class="upgrade-cta">
                <p>Passez à Premium pour accéder à toutes les éditions !</p>
                <button @click="showUpgradeModal = true" class="btn-upgrade-profile">
                  <Icon icon="mdi:crown" />
                  <span>Passer à Premium</span>
                </button>
              </div>
            </div>

            <!-- Section Changement de mot de passe -->
            <div class="password-change-card">
              <div class="password-header">
                <Icon icon="mdi:lock-reset" class="password-icon" />
                <h3>Changer le mot de passe</h3>
              </div>

              <form @submit.prevent="handleChangePassword" class="password-form">
                <div class="form-group">
                  <label for="currentPassword">Mot de passe actuel</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      id="currentPassword"
                      v-model="passwordForm.currentPassword"
                      required
                      placeholder="Votre mot de passe actuel"
                      class="form-input"
                    />
                    <button type="button" @click="showCurrentPassword = !showCurrentPassword" class="toggle-password">
                      <Icon :icon="showCurrentPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="newPassword">Nouveau mot de passe</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      id="newPassword"
                      v-model="passwordForm.newPassword"
                      required
                      minlength="8"
                      placeholder="Minimum 8 caractères"
                      class="form-input"
                    />
                    <button type="button" @click="showNewPassword = !showNewPassword" class="toggle-password">
                      <Icon :icon="showNewPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirmPassword"
                      v-model="passwordForm.confirmPassword"
                      required
                      minlength="8"
                      placeholder="Confirmez le mot de passe"
                      class="form-input"
                      :class="{ 'input-error': passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword }"
                    />
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="toggle-password">
                      <Icon :icon="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                    </button>
                  </div>
                  <span v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="error-text">
                    Les mots de passe ne correspondent pas
                  </span>
                </div>

                <button
                  type="submit"
                  :disabled="changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
                  class="btn-change-password"
                >
                  <span v-if="changingPassword" class="spinner-small"></span>
                  <Icon v-else icon="mdi:check" />
                  <span>{{ changingPassword ? 'Modification...' : 'Modifier le mot de passe' }}</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Search and Sort Bar (visible for editions tabs) -->
          <SubscriberSearchBar
            v-if="['free', 'premium', 'myeditions'].includes(activeTab)"
            v-model:search-query="searchQuery"
            v-model:show-favorites-only="showFavoritesOnly"
            v-model:sort-by="sortBy"
            :favorites-count="favoritesCount"
          />

          <!-- Editions Gratuit -->
          <SubscriberEditionsGrid
            v-if="activeTab === 'free'"
            title="Éditions Gratuit"
            subtitle="Découvrez les aperçus et éditions gratuites de ALT News"
            header-icon="mdi:gift"
            :editions="freeEditions"
            variant="free"
            :loading="loadingEditions"
            :search-query="searchQuery"
            empty-title="Aucune édition gratuite disponible"
            empty-description="Les éditions gratuites seront affichées ici dès qu'elles seront publiées."
            :api-base-url="config.public.apiBaseUrl"
            :downloading-id="downloadingId"
            :is-favorite="isFavorite"
            :format-date="formatDate"
            @view="viewEdition"
            @download="(edition) => downloadEdition(edition, true)"
            @toggle-favorite="toggleFavorite"
            @clear-search="searchQuery = ''"
          />

          <!-- Editions Premium -->
          <SubscriberEditionsGrid
            v-if="activeTab === 'premium'"
            title="Éditions Premium"
            :subtitle="canAccessPremium ? 'Toutes les éditions premium incluses dans votre abonnement' : 'Achetez des éditions à l\'unité ou passez à un abonnement Premium'"
            header-icon="mdi:crown"
            :editions="premiumEditions"
            variant="premium"
            :loading="loadingEditions"
            :search-query="searchQuery"
            empty-title="Aucune édition premium disponible"
            empty-description="Les nouvelles éditions premium seront disponibles bientôt."
            :api-base-url="config.public.apiBaseUrl"
            :downloading-id="downloadingId"
            :unit-price="formatPriceDisplay(UNIT_PRICE)"
            :is-favorite="isFavorite"
            :is-locked="(edition) => !canAccessPremium && !isEditionPurchased(edition.id)"
            :is-purchased="isEditionPurchased"
            :format-date="formatDate"
            @view="viewEdition"
            @download="downloadEdition"
            @buy="buyEdition"
            @toggle-favorite="toggleFavorite"
            @clear-search="searchQuery = ''"
          >
            <template #upgrade-banner>
              <SubscriberUpgradeBanner
                v-if="!canAccessPremium"
                :upgrade-link="`/${currentLocale}/alt-news`"
              />
            </template>
          </SubscriberEditionsGrid>

          <!-- Mes Editions -->
          <SubscriberEditionsGrid
            v-if="activeTab === 'myeditions'"
            title="Mes Éditions"
            subtitle="Les éditions que vous avez achetées à l'unité"
            header-icon="mdi:bookmark-check"
            :editions="filteredPurchasedEditions"
            variant="purchased"
            :loading="loadingMyEditions"
            :search-query="searchQuery"
            empty-title="Aucune édition achetée"
            empty-description="Vous n'avez pas encore acheté d'édition à l'unité."
            :browse-link="`/${currentLocale}/alt-news`"
            :api-base-url="config.public.apiBaseUrl"
            :downloading-id="downloadingId"
            :is-favorite="isFavorite"
            :format-date="formatDate"
            @view="viewEdition"
            @download="downloadEdition"
            @toggle-favorite="toggleFavorite"
            @clear-search="searchQuery = ''"
          />

          <!-- Historique des Paiements -->
          <SubscriberPaymentHistory
            v-if="activeTab === 'payments'"
            :payments="paymentHistory"
            :loading="loadingPayments"
            :total-spent="totalSpent"
            :format-date="formatDate"
            :format-price="formatPriceDisplay"
            @download-invoice="downloadInvoice"
          />
        </div>

        <!-- CTA Section for non-subscribers -->
        <div v-if="!subscriptionData.isActive" class="no-subscription">
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <h2>Aucun abonnement actif</h2>
            <p>Abonnez-vous pour acceder a toutes les editions ALT News</p>
            <button type="button" class="btn-primary" @click="showUpgradeModal = true">
              Decouvrir nos offres
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- News Modal -->
    <NewsModal
      v-model="showNewsModal"
      :news="selectedNews"
      @view-articles="handleViewArticles"
    />

    <!-- PDF Password Modal -->
    <SubscriberPasswordModal
      :show="showPasswordModal"
      :password="currentPdfPassword"
      @close="closePasswordModal"
      @copied="showToast('Mot de passe copié !', 'success')"
    />

    <!-- Payment Modal for Unit Purchase -->
    <SubscriberPaymentModal
      :show="showPaymentModal"
      :edition="editionToBuy"
      :unit-price="UNIT_PRICE"
      :api-base-url="config.public.apiBaseUrl"
      :format-price="formatPriceDisplay"
      :initial-phone="getAuthUser()?.phone || ''"
      @close="closePaymentModal"
    />

    <!-- Modal d'upgrade de plan -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showUpgradeModal" class="upgrade-modal-overlay" @click.self="showUpgradeModal = false">
          <div class="upgrade-modal">
            <div class="upgrade-modal-header">
              <h3>Changer de plan</h3>
              <button class="btn-close-modal" @click="showUpgradeModal = false" type="button">
                <span>×</span>
              </button>
            </div>
            <div class="upgrade-modal-body">
              <SubscriptionCompo @open-login-modal="showUpgradeModal = false; showLoginModal = true" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de connexion -->
    <LoginModal v-model="showLoginModal" @login-success="showLoginModal = false" @register-click="showLoginModal = false; showUpgradeModal = true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSubscription } from '~/composables/useSubscription'
import { useAuth } from '~/composables/useAuth'
import { useRoute, navigateTo } from '#app'
import { Icon } from "@iconify/vue"
import { useI18n } from 'vue-i18n'
import SubscriptionCompo from '~/components/SubscriptionCompo.vue'
import LoginModal from '~/components/LoginModal.vue'

// Appliquer le middleware d'authentification
definePageMeta({
  middleware: 'auth'
})

const config = useRuntimeConfig()
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const { formatDate } = useFormatDate()

// Recuperer la locale courante depuis l'URL
const currentLocale = computed(() => {
  const pathParts = route.path.split('/')
  const loc = pathParts[1]
  return ['fr', 'en'].includes(loc) ? loc : 'fr'
})

const { formatPrice } = useSubscription()
const { isLoggedIn, getAuthUser, logout } = useAuth()

// Helper pour afficher les prix
const formatPriceDisplay = (price: number) => formatPrice(price, 'FCFA')

// State
const isLoading = ref(true)
const loadingEditions = ref(true)
const loadingMyEditions = ref(true)
const loadingPayments = ref(true)
const downloadingId = ref<number | string | null>(null)
const activeTab = ref('profile')
const showNewsModal = ref(false)
const selectedNews = ref<any>(null)

const showPaymentModal = ref(false)

// Modal pour upgrade de plan
const showUpgradeModal = ref(false)
const showLoginModal = ref(false)
const editionToBuy = ref<any>(null)
const { actif: modeTest, tarif } = useModeTest()

// Prix unitaire d'une édition, ramené à 100 F sur l'URL de recette.
const UNIT_PRICE = computed(() => tarif(2000))

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const changingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Toast notifications
const toast = ref<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false
})

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toast.value = { message, type, visible: true }
  setTimeout(() => {
    toast.value.visible = false
  }, 4000)
}

// PDF Password Modal
const showPasswordModal = ref(false)
const currentPdfPassword = ref('')

const showPdfPasswordModal = (password: string) => {
  currentPdfPassword.value = password
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  currentPdfPassword.value = ''
}

// Data
const subscriptionData = ref<any>({
  isActive: false,
  plan: null,
  startDate: null,
  endDate: null
})

const allEditions = ref<any[]>([])
const myPurchasedEditions = ref<any[]>([])
const paymentHistory = ref<any[]>([])

// Search and Sort
const searchQuery = ref('')
const sortBy = ref<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc'>('date_desc')

// Favorites System
const favorites = ref<string[]>([])
const showFavoritesOnly = ref(false)

// Load favorites from localStorage
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem('altNewsFavorites')
    if (stored) {
      favorites.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading favorites:', e)
  }
}

// Save favorites to localStorage
const saveFavorites = () => {
  try {
    localStorage.setItem('altNewsFavorites', JSON.stringify(favorites.value))
  } catch (e) {
    console.error('Error saving favorites:', e)
  }
}

// Check if edition is favorited
const isFavorite = (editionId: string | number) => {
  return favorites.value.includes(String(editionId))
}

// Toggle favorite status
const toggleFavorite = (editionId: string | number) => {
  const id = String(editionId)
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
    showToast('Retiré des favoris', 'info')
  } else {
    favorites.value.push(id)
    showToast('Ajouté aux favoris', 'success')
  }
  saveFavorites()
}

// Filter by favorites
const filterByFavorites = (editions: any[]) => {
  if (!showFavoritesOnly.value) return editions
  return editions.filter(e => isFavorite(e.id))
}

// Computed
// Types donnant acces a tout le premium (aligne sur canAccessPaidEdition cote API).
// 'student_iua' etait absent : les abonnes IUA restaient bloques malgre un abonnement valide.
const PREMIUM_PLAN_TYPES = ['annual', 'student', 'student_iua', 'monthly']

const canAccessPremium = computed(() => {
  const planType = subscriptionData.value.plan?.type
  // Le type ne suffit pas : un étudiant dont la carte n'est pas encore
  // validée a bien le type « student », mais son statut est
  // `pending_validation`. L'accès n'est ouvert qu'une fois l'abonnement actif.
  return PREMIUM_PLAN_TYPES.includes(planType) && subscriptionData.value.isActive === true
})

// Helper function to sort editions
const sortEditions = (editions: any[]) => {
  return [...editions].sort((a, b) => {
    switch (sortBy.value) {
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'title_asc':
        return a.title.localeCompare(b.title)
      case 'title_desc':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })
}

// Helper function to filter editions by search
const filterBySearch = (editions: any[]) => {
  if (!searchQuery.value.trim()) return editions
  const query = searchQuery.value.toLowerCase().trim()
  return editions.filter(e =>
    e.title.toLowerCase().includes(query) ||
    (e.description && e.description.toLowerCase().includes(query)) ||
    (e.edition_number && String(e.edition_number).includes(query))
  )
}

const freeEditions = computed(() => {
  // Afficher les éditions gratuites (is_free === true)
  // Si aucune édition n'a is_free défini, considérer toutes les éditions comme gratuites par défaut
  let free = allEditions.value.filter(e => e.is_free === true || e.type === 'free')
  if (free.length === 0 && allEditions.value.every(e => e.is_free === undefined || e.is_free === null)) {
    // Si is_free n'est pas défini sur aucune édition, toutes sont gratuites par défaut
    free = allEditions.value
  }
  return filterByFavorites(sortEditions(filterBySearch(free)))
})

const premiumEditions = computed(() => {
  // Afficher uniquement les vraies éditions premium (is_free === false)
  // Ne pas afficher de fallback - s'il n'y a pas d'éditions premium, la liste reste vide
  const premium = allEditions.value.filter(e => e.is_free === false || e.type === 'premium')
  return filterByFavorites(sortEditions(filterBySearch(premium)))
})

const filteredPurchasedEditions = computed(() => {
  return filterByFavorites(sortEditions(filterBySearch(myPurchasedEditions.value)))
})

// Count favorites
const favoritesCount = computed(() => favorites.value.length)

const totalSpent = computed(() => {
  return paymentHistory.value
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
})

// Calcul des jours avant expiration
const daysUntilExpiration = computed(() => {
  if (!subscriptionData.value.endDate) return null
  const end = new Date(subscriptionData.value.endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

// Alerte si expiration dans moins de 15 jours
const isExpirationSoon = computed(() => {
  if (!daysUntilExpiration.value) return false
  return daysUntilExpiration.value <= 15 && daysUntilExpiration.value > 0
})

const availableTabs = computed(() => {
  return [
    { id: 'profile', label: 'Mon Profil', icon: 'mdi:account', count: 0 },
    { id: 'free', label: 'Éditions Gratuit', icon: 'mdi:gift', count: freeEditions.value.length },
    { id: 'premium', label: 'Éditions Premium', icon: 'mdi:crown', count: canAccessPremium.value ? premiumEditions.value.length : 0 },
    { id: 'myeditions', label: 'Mes Éditions', icon: 'mdi:bookmark-check', count: myPurchasedEditions.value.length },
    { id: 'payments', label: 'Historique Paiements', icon: 'mdi:receipt-text', count: paymentHistory.value.length }
  ]
})

// Methods
const getPlanDescription = () => {
  const planType = subscriptionData.value.plan?.type
  switch (planType) {
    case 'free': return 'Accès aux éditions gratuites uniquement'
    case 'student': return 'Tarif étudiant - Accès complet 12 mois'
    case 'annual': return 'Abonnement annuel - Accès complet 12 mois'
    case 'monthly': return 'Abonnement mensuel'
    default: return 'Plan d\'abonnement'
  }
}

const viewEdition = (edition: any) => {
  selectedNews.value = edition
  showNewsModal.value = true
}

const isEditionPurchased = (editionId: number | string) => {
  return myPurchasedEditions.value.some(e => e.id === editionId)
}

const buyEdition = (edition: any) => {
  editionToBuy.value = edition
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  editionToBuy.value = null
}

const handleLogout = () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    logout()
    showToast('Déconnexion réussie', 'success')
    setTimeout(() => {
      navigateTo(`/${currentLocale.value}/alt-news`)
    }, 500)
  }
}

// Changer le mot de passe
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('Les mots de passe ne correspondent pas', 'error')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    showToast('Le mot de passe doit contenir au moins 8 caractères', 'error')
    return
  }

  changingPassword.value = true
  const token = localStorage.getItem('authToken')

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: passwordForm.value.currentPassword,
        new_password: passwordForm.value.newPassword,
        new_password_confirmation: passwordForm.value.confirmPassword
      })
    })

    if (response.ok) {
      showToast('Mot de passe modifié avec succès', 'success')
      // Réinitialiser le formulaire
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401 || errorData.message?.includes('incorrect')) {
        showToast('Mot de passe actuel incorrect', 'error')
      } else {
        showToast(errorData.message || 'Erreur lors de la modification du mot de passe', 'error')
      }
    }
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    showToast('Erreur lors de la modification du mot de passe', 'error')
  } finally {
    changingPassword.value = false
  }
}

const handleCancelSubscription = () => {
  const confirmed = confirm(
    'Êtes-vous sûr de vouloir annuler votre abonnement ?\n\n' +
    'Vous conserverez l\'accès jusqu\'à la fin de votre période actuelle, ' +
    'mais votre abonnement ne sera pas renouvelé automatiquement.'
  )

  if (confirmed) {
    subscriptionData.value.autoRenew = false
    const savedPlan = localStorage.getItem('selectedPlan')
    if (savedPlan) {
      const plan = JSON.parse(savedPlan)
      plan.autoRenew = false
      plan.cancelledAt = new Date().toISOString()
      localStorage.setItem('selectedPlan', JSON.stringify(plan))
    }
    showToast('Abonnement annulé. Vous conservez l\'accès jusqu\'au ' + formatDate(subscriptionData.value.endDate), 'info')
  }
}

const downloadEdition = async (edition: any, forceFreePdf: boolean = false) => {
  downloadingId.value = edition.id
  const token = localStorage.getItem('authToken')

  try {
    // Déterminer si on doit télécharger la version gratuite ou premium
    // forceFreePdf = true quand on est dans l'onglet "Éditions Gratuit"
    // Sinon, si l'utilisateur a un accès premium, télécharger la version premium
    const shouldDownloadFree = forceFreePdf || (!canAccessPremium.value && !isEditionPurchased(edition.id))

    if (token) {
      // Si on veut la version gratuite
      if (shouldDownloadFree) {
        const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/download-free/${edition.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.download_url) {
            window.open(data.download_url, '_blank')
            showToast('Téléchargement de l\'édition gratuite en cours...', 'info')
            return
          }
        } else if (response.status === 404) {
          showToast('Cette édition n\'a pas de version gratuite disponible.', 'error')
          return
        }
      }

      // Télécharger la version premium (pour les abonnés ou achats unitaires)
      const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/request-download/${edition.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.download_token) {
          const downloadUrl = `${config.public.apiBaseUrl}/api/subscription/download/${data.download_token}`
          window.open(downloadUrl, '_blank')
          showToast('Téléchargement du PDF premium en cours...', 'info')

          if (data.pdf_password) {
            setTimeout(() => {
              showPdfPasswordModal(data.pdf_password)
            }, 1000)
          }
          return
        }
      } else if (response.status === 403) {
        showToast('Vous n\'avez pas accès à cette édition premium.', 'error')
        return
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erreur API téléchargement:', response.status, errorData)
        showToast(errorData.message || 'Erreur lors de la demande de téléchargement.', 'error')
        return
      }
    }

    // Fallback: télécharger directement depuis l'URL du PDF si disponible
    const pdfUrl = edition.pdf_url || edition.pdfUrl || edition.pdf || edition.free_pdf_file
    if (pdfUrl) {
      const fullUrl = pdfUrl.startsWith('http')
        ? pdfUrl
        : `${config.public.apiBaseUrl}/storage/${pdfUrl}`
      window.open(fullUrl, '_blank')
      showToast('Téléchargement du PDF en cours...', 'info')
    } else {
      showToast('Le PDF de cette édition n\'est pas encore disponible.', 'error')
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    showToast('Erreur lors du téléchargement du PDF.', 'error')
  } finally {
    downloadingId.value = null
  }
}

const downloadInvoice = (payment: any) => {
  if (payment.invoiceUrl) {
    window.open(payment.invoiceUrl, '_blank')
  }
}

const handleViewArticles = (newsId: number | string) => {
  navigateTo(localePath({ name: 'alt-news-id', params: { id: newsId } }))
}

// Fetch data
const fetchAllEditions = async () => {
  loadingEditions.value = true
  try {
    // Utiliser l'API alt-news (meme endpoint que /fr/alt-news)
    const response = await fetch(`${config.public.apiBaseUrl}/api/alt-news`, {
      method: 'GET',
      headers: {
        'Accept-Language': locale.value,
        'Accept': 'application/json',
        'company': 'conseil'
      }
    })
    if (response.ok) {
      const editions = await response.json()
      allEditions.value = editions.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date || e.publication_date || e.created_at,
        image: e.image || e.cover_image,
        description: e.description,
        price: e.price || UNIT_PRICE.value,
        is_free: e.has_free_version || e.is_free || false,
        type: (e.has_free_version || e.is_free) ? 'free' : 'premium',
        edition_number: e.edition_number || (e.title ? String(e.title).match(/\d+/g)?.[0] : null),
        pdf_url: e.pdf_url || e.pdf || e.pdf_file,
        free_pdf_file: e.free_pdf_file
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des editions:', error)
  } finally {
    loadingEditions.value = false
  }
}

const fetchMyEditions = async () => {
  loadingMyEditions.value = true
  try {
    // Source de verite : les achats enregistres cote serveur.
    // Le localStorage ne sert plus que de repli hors-ligne : sinon un numero paye
    // disparait des qu'on change de navigateur, d'appareil ou qu'on vide le cache.
    const token = localStorage.getItem('authToken')

    if (token) {
      const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const purchases = (data.purchases || []).filter((p: any) => p.status === 'completed')

        myPurchasedEditions.value = purchases.map((p: any) => {
          const edition = p.edition || {}
          return {
            id: edition.id ?? p.edition_id,
            title: edition.title,
            date: edition.publication_date || edition.date,
            image: edition.cover_image || edition.image,
            description: edition.description,
            price: p.amount ?? edition.price,
            edition_number: edition.edition_number,
            pdf_url: edition.pdf_url || edition.pdf_file,
            free_pdf_file: edition.free_pdf_file,
            purchased_at: p.created_at
          }
        })

        localStorage.setItem('purchasedEditions', JSON.stringify(myPurchasedEditions.value))
        return
      }
    }

    // Repli : cache local si l'API est injoignable ou la session expiree
    if (myPurchasedEditions.value.length === 0) {
      const storedEditions = localStorage.getItem('purchasedEditions')
      if (storedEditions) {
        myPurchasedEditions.value = JSON.parse(storedEditions)
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de vos editions:', error)
    if (myPurchasedEditions.value.length === 0) {
      const storedEditions = localStorage.getItem('purchasedEditions')
      if (storedEditions) {
        myPurchasedEditions.value = JSON.parse(storedEditions)
      }
    }
  } finally {
    loadingMyEditions.value = false
  }
}

const fetchPaymentHistory = async () => {
  loadingPayments.value = true
  try {
    // Source de vérité : le backend. L'ancien cache local ne voyait jamais les
    // paiements réels — l'historique restait vide après un achat.
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    if (!response.ok) return

    const data = await response.json()
    const subscriber = data.subscriber || {}
    const lignes: any[] = []

    if (Number(subscriber.amount_paid) > 0 && subscriber.payment_reference) {
      const nomPlan = subscriber.type === 'annual' ? 'Premium Annuel'
        : subscriber.type === 'student' ? 'Étudiant'
        : subscriber.type
      lignes.push({
        id: `sub-${subscriber.id}`,
        date: subscriber.started_at,
        description: `Abonnement ${nomPlan}`,
        amount: Number(subscriber.amount_paid),
        type: 'subscription',
        status: subscriber.status === 'pending_validation' ? 'pending' : 'completed',
        reference: subscriber.payment_reference,
        invoiceUrl: null
      })
    }

    for (const p of (data.purchases || [])) {
      lignes.push({
        id: `ed-${p.id}`,
        date: p.created_at,
        description: `Achat édition : ${p.edition?.title || ('n°' + p.edition_id)}`,
        amount: Number(p.amount),
        type: 'single',
        status: p.status,
        reference: p.payment_reference,
        invoiceUrl: null
      })
    }

    lignes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    paymentHistory.value = lignes
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  } finally {
    loadingPayments.value = false
  }
}

const loadSubscriptionData = async () => {
  if (!isLoggedIn()) {
    // /subscriber n'existe pas (page desactivee) : y rediriger affichait un 404
    navigateTo(`/${currentLocale.value}/alt-news`)
    return
  }

  const token = localStorage.getItem('authToken')

  if (token) {
    try {
      const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const subscriber = data.subscriber

        // Mettre à jour les données utilisateur dans localStorage avec les données de l'API
        const currentUser = getAuthUser() || {}
        const updatedUser = {
          ...currentUser,
          id: subscriber.id,
          email: subscriber.email,
          firstName: subscriber.first_name,
          lastName: subscriber.last_name,
          phone: subscriber.phone
        }
        localStorage.setItem('authUser', JSON.stringify(updatedUser))

        subscriptionData.value.isActive = subscriber.status === 'active'
        subscriptionData.value.startDate = subscriber.started_at ? new Date(subscriber.started_at) : new Date()
        subscriptionData.value.endDate = subscriber.expires_at ? new Date(subscriber.expires_at) : null
        subscriptionData.value.autoRenew = true

        const planMap: { [key: string]: any } = {
          'free': { type: 'free', name: 'Gratuit', price: 0, features: ['Compte gratuit', 'Accès aux versions gratuites', 'Newsletter'] },
          'student': { type: 'student', name: 'Étudiant', price: 10000, features: ['Accès complet 12 mois', 'Versions premium', 'Tarif réduit'] },
          // Absent jusqu'ici : les abonnés IUA / AUPROHADA-UCAO retombaient sur « Gratuit ».
          'student_iua': { type: 'student_iua', name: 'Étudiant IUA / AUPROHADA-UCAO', price: 0, features: ['Accès 100 % gratuit', 'Intégralité des contenus Premium', 'Accès illimité sur 12 mois'] },
          'annual': { type: 'annual', name: 'Premium Annuel', price: 20000, features: ['Accès complet 12 mois', 'Versions premium', 'Envoi automatique', 'Accès archives'] },
          'monthly': { type: 'monthly', name: 'Premium Mensuel', price: 5000, features: ['Accès complet 1 mois', 'Versions premium'] }
        }

        subscriptionData.value.plan = planMap[subscriber.type] || planMap['free']

        if (data.purchases && data.purchases.length > 0) {
          myPurchasedEditions.value = data.purchases.map((p: any) => ({
            id: p.edition.id,
            title: p.edition.title,
            image: p.edition.cover_image,
            purchaseDate: p.created_at,
            price: p.amount
          }))
        }
        return
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil API:', error)
    }
  }

  // Fallback: charger depuis localStorage
  const savedPlan = localStorage.getItem('selectedPlan')
  if (savedPlan) {
    try {
      const plan = JSON.parse(savedPlan)
      subscriptionData.value.plan = plan
      subscriptionData.value.isActive = true
      subscriptionData.value.startDate = new Date()

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
    subscriptionData.value.plan = {
      type: 'free',
      name: 'Gratuit',
      price: 0,
      features: ['Compte gratuit', 'Acces aux versions gratuites', 'Newsletter']
    }
    subscriptionData.value.isActive = true
  }
}

onMounted(async () => {
  isLoading.value = true
  loadFavorites()
  await loadSubscriptionData()
  await Promise.all([
    fetchAllEditions(),
    fetchMyEditions(),
    fetchPaymentHistory()
  ])

  isLoading.value = false
})

useHead({
  title: 'Mon espace abonné - ALT News',
  meta: [
    { name: 'description', content: 'Gérez votre abonnement ALT News et accédez à vos éditions.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.bandeau-recette {
  background: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  color: #92400e;
  padding: 0.75rem 1.25rem;
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.5;
  position: sticky;
  top: 0;
  z-index: 500;
}

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
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #fecaca;
  transform: translateY(-2px);
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

.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #d4b128;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-page p {
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 1.1rem;
}

.subscription-content {
  /* Container for all subscription content */
}

.tab-content {
  /* Container for tab content */
}

.no-subscription {
  margin-top: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 2rem;
  background: #d4b128;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 177, 40, 0.3);
}

@media (max-width: 768px) {
  .manage-page {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .header-top {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

/* Tab Profil */
.profile-tab {
  margin-bottom: 2rem;
}

.profile-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #d4b128, #b89a22);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.profile-info h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.profile-email {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.detail-icon {
  font-size: 1.5rem;
  color: #d4b128;
  flex-shrink: 0;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.detail-value {
  display: block;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.plan-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem !important;
}

.plan-badge.free {
  background: linear-gradient(135deg, #9E73B0, #7B1FA2);
  color: white;
}

.plan-badge.student,
.plan-badge.annual,
.plan-badge.monthly {
  background: linear-gradient(135deg, #d4b128, #b89a22);
  color: white;
}

.upgrade-cta {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-radius: 12px;
  border: 2px solid #d4b128;
  text-align: center;
}

.upgrade-cta p {
  color: #6b7280;
  margin: 0 0 1rem;
}

.btn-upgrade-profile {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: #d4b128;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-upgrade-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 177, 40, 0.3);
}

/* Password Change Card */
.password-change-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 2rem;
}

.password-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.password-icon {
  font-size: 2rem;
  color: #d4b128;
}

.password-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.password-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.password-form label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-form .form-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.password-form .form-input:focus {
  outline: none;
  border-color: #d4b128;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 177, 40, 0.1);
}

.password-form .form-input.input-error {
  border-color: #dc2626;
  background: #fef2f2;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.25rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #d4b128;
}

.error-text {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.btn-change-password {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #d4b128;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-change-password:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

.btn-change-password:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .password-change-card {
    padding: 1.5rem;
  }
}

/* Modal d'upgrade */
.upgrade-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  /*
    Surtout pas `center` : un voile défilant qui centre son enfant rend le haut
    de celui-ci inatteignable dès qu'il dépasse la hauteur d'écran — le contenu
    déborde des deux côtés et le défilement ne le rattrape pas.
    `margin: auto` sur l'enfant garde le centrage tant qu'il tient.
  */
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.upgrade-modal {
  background: white;
  border-radius: 20px;
  max-width: 1200px;
  width: 100%;
  margin: auto;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  /* Le défilement tactile doit rester fluide dans la fenêtre sur mobile. */
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 20px 60px rgba(107, 33, 168, 0.2);
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

.upgrade-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #d4b128;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.upgrade-modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4b128;
  margin: 0;
}

.btn-close-modal {
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

.btn-close-modal:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.upgrade-modal-body {
  padding: 0;
}

/*
  `SubscriptionCompo` est une page entière : elle impose `min-height: 100vh`.
  Encapsulée dans une fenêtre, cette hauteur la faisait déborder et repoussait
  le bouton « Finaliser mon abonnement » hors du champ visible.
*/
.upgrade-modal-body :deep(.subscriber-page) {
  min-height: 0;
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

.modal-enter-active .upgrade-modal,
.modal-leave-active .upgrade-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .upgrade-modal,
.modal-leave-to .upgrade-modal {
  transform: scale(0.9);
}
</style>
