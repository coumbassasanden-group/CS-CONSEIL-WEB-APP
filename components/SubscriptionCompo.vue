<template>
  <div class="subscriber-page">

    <!-- Plans Section -->
    <section id="plans" class="plans-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Choisissez votre plan</h2>
          <p class="section-subtitle">
            Des formules adaptées à tous les besoins, sans engagement
          </p>
        </div>

        <!-- Loading state -->
        <div v-if="plansLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des plans d'abonnement...</p>
        </div>

        <!-- Plans Grid -->
        <div v-if="!plansLoading && subscriptionPlans.length > 0" class="pricing-grid">
          <PricingCard
            v-for="plan in subscriptionPlans"
            :key="plan.id"
            :plan="plan"
            :is-selected="subscriptionForm.planId === plan.id"
            @select="handlePlanSelect"
          />
        </div>

        <!-- Error state -->
        <div v-if="plansError" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{{ plansError }}</p>
          <button class="btn-retry" @click="retryLoadPlans">
            Réessayer
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="!plansLoading && subscriptionPlans.length === 0 && !plansError" class="empty-state">
          <p>Aucun plan d'abonnement disponible pour le moment.</p>
        </div>
      </div>
    </section>

    <!-- Form Section - New Email-First Workflow -->
    <section v-if="subscriptionForm.planId" class="form-section">
      <div class="container-small">
        <SubscriptionFormEmail />
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container-small">
        <div class="section-header">
          <h2 class="section-title">Questions fréquentes</h2>
          <p class="section-subtitle">
            Tout ce que vous devez savoir sur nos abonnements
          </p>
        </div>

        <div class="faq-list">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="faq-item"
            :class="{ active: activeFaq === faq.id }"
            @click="toggleFaq(faq.id)"
          >
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <span class="faq-icon">{{ activeFaq === faq.id ? '−' : '+' }}</span>
            </div>
            <Transition name="slide">
              <div v-if="activeFaq === faq.id" class="faq-answer">
                {{ faq.answer }}
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>


    <!-- Payment Modal -->
    <PaymentAlert
      :is-visible="showPaymentModal"
      :type="paymentModalType"
      :title="paymentModalTitle"
      :message="paymentModalMessage"
      :details="paymentModalDetails"
      :progress="paymentProgress"
      @close="closePaymentModal"
      @confirm="handlePaymentConfirm"
      @retry="handlePaymentRetry"
    />
  </div>
</template>

<script setup lang="ts">
const {
  subscriptionPlans,
  subscriptionForm,
  testimonials,
  faqs,
  stats,
  isProcessing,
  errorMessage,
  plansLoading,
  plansError,
  getSelectedPlan,
  selectPlan,
  processSubscription,
  resetForm,
  fetchPlans
} = useSubscription()

// État local
const activeFaq = ref<number | null>(null)
const showPaymentModal = ref(false)
const paymentModalType = ref<'success' | 'error' | 'warning' | 'processing'>('processing')
const paymentModalTitle = ref('')
const paymentModalMessage = ref('')
const paymentModalDetails = ref<Record<string, string> | undefined>(undefined)
const paymentProgress = ref(0)

// Charger les plans au montage
onMounted(async () => {
  await fetchPlans()
})

// Recharger les plans
const retryLoadPlans = async () => {
  await fetchPlans()
}

// Gestion de la sélection de plan
const handlePlanSelect = (planId: string) => {
  selectPlan(planId)
  
  // Scroll vers le formulaire
  nextTick(() => {
    const formSection = document.querySelector('.form-section')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// Gestion de la soumission
const handleSubmit = async () => {
  // Afficher la modal de traitement
  showPaymentModal.value = true
  paymentModalType.value = 'processing'
  paymentModalTitle.value = 'Traitement du paiement'
  paymentModalMessage.value = 'Veuillez patienter pendant que nous traitons votre paiement...'
  paymentProgress.value = 0

  // Simuler la progression
  const progressInterval = setInterval(() => {
    paymentProgress.value += 10
    if (paymentProgress.value >= 90) {
      clearInterval(progressInterval)
    }
  }, 200)

  const success = await processSubscription()

  clearInterval(progressInterval)
  paymentProgress.value = 100

  await new Promise(resolve => setTimeout(resolve, 500))

  if (success) {
    const plan = getSelectedPlan.value
    paymentModalType.value = 'success'
    paymentModalTitle.value = 'Paiement réussi !'
    paymentModalMessage.value = `Félicitations ! Votre abonnement ${plan?.name} a été activé avec succès.`
    paymentModalDetails.value = {
      'Plan': plan?.name || '',
      'Montant': `${plan?.price}€ / ${plan?.period === 'month' ? 'mois' : 'an'}`,
      'Date de début': new Date().toLocaleDateString('fr-FR'),
      'Prochain paiement': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    }
  } else {
    paymentModalType.value = 'error'
    paymentModalTitle.value = 'Erreur de paiement'
    paymentModalMessage.value = errorMessage.value || 'Une erreur est survenue lors du traitement de votre paiement.'
  }
}

// Gestion de la modal
const closePaymentModal = () => {
  showPaymentModal.value = false
  paymentProgress.value = 0
}

const handlePaymentConfirm = () => {
  closePaymentModal()
  navigateTo('/subscriber/success')
}

const handlePaymentRetry = () => {
  closePaymentModal()
  handleSubmit()
}

// Toggle FAQ
const toggleFaq = (id: number) => {
  activeFaq.value = activeFaq.value === id ? null : id
}

// Scroll vers les plans
const scrollToPlans = () => {
  const plansSection = document.querySelector('#plans')
  if (plansSection) {
    plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// SEO
useHead({
  title: 'Abonnement ALT News - Accédez à l\'information de qualité',
  meta: [
    { name: 'description', content: 'Découvrez nos formules d\'abonnement et accédez à du contenu exclusif, des analyses approfondies et des reportages de qualité.' }
  ]
})
</script>

<style scoped>
.subscriber-page {
  min-height: 100vh;
  background: #ffffff;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.container-small {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero Section */
.hero-section {
  padding: 6rem 0 4rem;
  background: linear-gradient(135deg, var(--cs-light-brown-color) 0%, #fef7f0 50%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="%236366f1" opacity="0.1"/></svg>');
  background-size: 50px 50px;
  opacity: 0.4;
}

.hero-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  background: white;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: var(--cs-brown-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.7;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-top: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--cs-brown-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

/* Sections */
.plans-section,
.form-section,
.testimonials-section,
.faq-section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Testimonials */
.testimonials-section {
  background: #f9fafb;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.testimonial-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--cs-brown-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.testimonial-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.testimonial-info p {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.testimonial-rating {
  margin-bottom: 1rem;
}

.star {
  color: #fbbf24;
  font-size: 1.2rem;
}

.testimonial-comment {
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: var(--cs-brown-color);
}

.faq-item.active {
  border-color: var(--cs-brown-color);
  box-shadow: 0 4px 20px rgba(139, 92, 46, 0.15);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  font-size: 1.05rem;
}

.faq-icon {
  font-size: 1.5rem;
  color: var(--cs-brown-color);
  font-weight: bold;
  transition: transform 0.3s ease;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  color: #6b7280;
  line-height: 1.7;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* CTA Section */
.cta-section {
  padding: 5rem 0;
  background: var(--cs-brown-color);
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.btn-cta {
  padding: 1.2rem 3rem;
  border: 2px solid white;
  border-radius: 12px;
  background: white;
  color: var(--cs-brown-color);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cta:hover {
  background: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--cs-brown-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  background: #fee2e2;
  border-radius: 12px;
  border-left: 4px solid #dc2626;
}

.error-icon {
  font-size: 2.5rem;
}

.error-state h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #991b1b;
  margin: 0;
}

.error-state p {
  font-size: 1rem;
  color: #7f1d1d;
  margin: 0;
  text-align: center;
  max-width: 500px;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-stats {
    gap: 2rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .pricing-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .plans-section,
  .form-section,
  .testimonials-section,
  .faq-section {
    padding: 3rem 0;
  }

  .cta-content h2 {
    font-size: 2rem;
  }
}
</style>
