<template>
  <div 
    class="pricing-card" 
    :class="{ 
      'popular': plan.popular,
      'selected': isSelected
    }"
    @click="selectAndSavePlan"
  >
    <!-- Badge Popular -->
    <div v-if="plan.popular" class="popular-badge">
      <span>✨ Le plus populaire</span>
    </div>

    <!-- En-tête -->
    <div class="pricing-header">
      <div class="plan-icon">{{ plan.icon }}</div>
      <h3 class="plan-name">{{ plan.name }}</h3>
      <div class="plan-price">
        <span v-if="plan.price === 0" class="free-text">Gratuit</span>
        <template v-else>
          <span class="amount">{{ formatPrice(plan.price) }}</span>
          <span class="currency">FCFA</span>
          <span v-if="plan.period && plan.period !== 'once' && plan.period !== 'free'" class="period">
            / {{ getPeriodLabel(plan.period) }}
          </span>
        </template>
      </div>
    </div>

    <!-- Fonctionnalités -->
    <div class="pricing-features">
      <ul>
        <li v-for="(feature, index) in plan.features" :key="index">
          <span class="check-icon">✓</span>
          <span>{{ feature }} {{ plan.features.length }} </span>
        </li>
      </ul>
    </div>

    <!-- Bouton -->
    <div class="pricing-footer">
      <button 
        class="btn-subscribe"
        :class="{ 'btn-selected': isSelected }"
        type="button"
      >
        <span v-if="isSelected">✓ Sélectionné</span>
        <span v-else>Choisir ce plan</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Plan {
  id: string
  name: string
  price: number
  currency?: string
  period?: string
  features: string[]
  color?: string
  popular?: boolean
  icon?: string
  description?: string
  duration?: number
}

interface Props {
  plan: Plan
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<{
  select: [planId: string]
}>()

onMounted(() => {
   console.log('PricingCard mounted with plan:', props.plan)
})

const selectAndSavePlan = () => {
  // Sauvegarder le plan complet dans localStorage
  localStorage.setItem('selectedPlan', JSON.stringify(props.plan))
  // Émettre l'événement pour mettre à jour le formulaire
  emit('select', props.plan.id)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price)
}

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    'month': 'mois',
    'year': 'an',
    'once': '',
    'free': ''
  }
  return labels[period] || period
}
</script>

<style scoped>
.pricing-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.pricing-card.selected {
  border-color: var(--cs-brown-color);
  box-shadow: 0 8px 30px rgba(139, 92, 46, 0.3);
}

.pricing-card.popular {
  border-color: var(--cs-brown-color);
  background: linear-gradient(135deg, #fef7f0 0%, #ffffff 100%);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: var(--cs-brown-color);
  color: white;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.4);
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.plan-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.plan-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.free-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: #10b981;
}

.currency {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--cs-brown-color);
  margin-left: 0.2rem;
}

.amount {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
}

.period {
  font-size: 0.95rem;
  color: #6b7280;
  white-space: nowrap;
}

.pricing-features {
  flex: 1;
  margin-bottom: 2rem;
}

.pricing-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.5;
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

.pricing-footer {
  margin-top: auto;
}

.btn-subscribe {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-subscribe:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-subscribe.btn-selected {
  background: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-subscribe:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .pricing-card {
    padding: 1.5rem;
  }

  .plan-name {
    font-size: 1.5rem;
  }

  .amount {
    font-size: 2.5rem;
  }
}
</style>
