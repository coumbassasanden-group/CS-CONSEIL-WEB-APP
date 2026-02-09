<template>
  <div class="plan-info-card">
    <div class="card-header">
      <div class="header-left">
        <span class="plan-icon">
          <Icon icon="marketeq:gold-medal" />
        </span>
        <div>
          <h2>Plan {{ plan?.name }}</h2>
          <p class="plan-description">{{ planDescription }}</p>
        </div>
      </div>
      <span class="status-badge" :class="isActive ? 'active' : 'inactive'">
        {{ isActive ? 'Actif' : 'Inactif' }}
      </span>
    </div>

    <div class="card-body">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label"><Icon icon="mdi:currency-usd" /> Montant</span>
          <span class="info-value">{{ formatPrice(plan?.price || 0) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><Icon icon="mdi:calendar" /> Date de début</span>
          <span class="info-value">{{ formatDate(startDate) }}</span>
        </div>
        <div v-if="endDate" class="info-item">
          <span class="info-label"><Icon icon="mdi:calendar-clock" /> Date d'expiration</span>
          <span class="info-value" :class="{ 'expiring-soon': isExpirationSoon }">
            {{ formatDate(endDate) }}
            <span v-if="isExpirationSoon" class="expiring-badge">{{ daysUntilExpiration }}j</span>
          </span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <h3 class="features-title">Avantages inclus :</h3>
      <ul class="features-list">
        <li v-for="(feature, index) in plan?.features" :key="index">
          <span class="check-icon">✓</span>
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>

    <!-- Actions de gestion d'abonnement -->
    <div class="plan-actions">
      <!-- Bouton Upgrade pour plan gratuit -->
      <button
        v-if="plan?.type === 'free'"
        @click="$emit('upgrade')"
        class="btn-action upgrade"
      >
        <Icon icon="mdi:arrow-up-bold-circle" />
        <span>Passer à Premium</span>
      </button>

      <!-- Bouton Renouveler si proche de l'expiration -->
      <button
        v-if="canAccessPremium && isExpirationSoon"
        @click="$emit('upgrade')"
        class="btn-action renew"
      >
        <Icon icon="mdi:refresh" />
        <span>Renouveler l'abonnement</span>
      </button>

      <!-- Bouton Changer de plan -->
      <button
        v-if="canAccessPremium && !isExpirationSoon"
        @click="$emit('upgrade')"
        class="btn-action change"
      >
        <Icon icon="mdi:swap-horizontal" />
        <span>Changer de plan</span>
      </button>

      <!-- Bouton Annuler -->
      <button
        v-if="canAccessPremium"
        @click="$emit('cancel')"
        class="btn-action cancel"
      >
        <Icon icon="mdi:cancel" />
        <span>Annuler l'abonnement</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface Plan {
  name?: string
  type?: string
  price?: number
  features?: string[]
}

defineProps<{
  plan: Plan | null
  isActive: boolean
  startDate: Date | string | null
  endDate: Date | string | null
  isExpirationSoon: boolean
  daysUntilExpiration: number | null
  canAccessPremium: boolean
  subscriberLink: string
  planDescription: string
  formatDate: (date: any) => string
  formatPrice: (price: number) => string
}>()

defineEmits<{
  cancel: []
  upgrade: []
}>()
</script>

<style scoped>
.plan-info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
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

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-value {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 700;
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
  flex-wrap: wrap;
  gap: 0.75rem;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
  background: #f9fafb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.check-icon {
  color: #059669;
  font-weight: bold;
}

.expiring-soon {
  color: #d97706 !important;
}

.expiring-badge {
  display: inline-block;
  background: #fef3c7;
  color: #d97706;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.plan-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action.upgrade {
  background: #d4b128;
  color: white;
}

.btn-action.upgrade:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

.btn-action.renew {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-action.renew:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-action.change {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-action.change:hover {
  background: #e5e7eb;
}

.btn-action.cancel {
  background: transparent;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-action.cancel:hover {
  background: #fee2e2;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
  }

  .plan-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
