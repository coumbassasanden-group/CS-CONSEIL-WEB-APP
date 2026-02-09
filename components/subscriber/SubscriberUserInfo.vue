<template>
  <div class="user-info-section">
    <div class="user-info-card">
      <div class="user-header">
        <div class="user-avatar">
          {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ user?.firstName }} {{ user?.lastName }}</h3>
          <p class="user-email">{{ user?.email }}</p>
          <span class="user-status">Abonné depuis le {{ formatDate(startDate) }}</span>
        </div>
      </div>
      <div class="user-meta">
        <div class="meta-item">
          <span class="meta-icon">
            <Icon icon="line-md:phone-filled" />
          </span>
          <div>
            <p class="meta-label">Telephone</p>
            <p class="meta-value">{{ user?.phone || 'Non fourni' }}</p>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">
            <Icon icon="mdi:card-account-details" />
          </span>
          <div>
            <p class="meta-label">Plan actuel</p>
            <p class="meta-value">{{ planName || 'Gratuit' }}</p>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">✅</span>
          <div>
            <p class="meta-label">Statut</p>
            <p class="meta-value">{{ isActive ? 'Actif' : 'Inactif' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface User {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

defineProps<{
  user: User | null
  startDate: Date | string | null
  planName: string | null
  isActive: boolean
  formatDate: (date: any) => string
}>()
</script>

<style scoped>
.user-info-section {
  margin-bottom: 2rem;
}

.user-info-card {
  background: #d4b128;
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  box-shadow: 0 8px 30px rgba(212, 177, 40, 0.3);
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
  color: white;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: white;
}

.user-email {
  font-size: 1.05rem;
  margin: 0 0 0.75rem 0;
  opacity: 0.95;
  color: white;
}

.user-status {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
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
  color: white;
}

.meta-label {
  font-size: 0.8rem;
  opacity: 0.85;
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.meta-value {
  font-size: 1.1rem;
  margin: 0.25rem 0 0 0;
  font-weight: 700;
  color: white;
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .user-info-card {
    padding: 1.5rem;
  }
}
</style>
