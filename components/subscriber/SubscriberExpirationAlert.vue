<template>
  <div class="expiration-alert">
    <div class="alert-content">
      <Icon icon="mdi:alert-circle" class="alert-icon" />
      <div class="alert-text">
        <strong>Votre abonnement expire bientot !</strong>
        <p>Il reste {{ daysUntilExpiration }} jours. Renouvelez maintenant pour ne pas perdre l'acces.</p>
      </div>
      <NuxtLink :to="renewLink" class="btn-renew">
        <Icon icon="mdi:refresh" /> Renouveler
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

defineProps<{
  daysUntilExpiration: number
  renewLink: string
}>()
</script>

<style scoped>
.expiration-alert {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.alert-icon {
  font-size: 2.5rem;
  color: #d97706;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
  min-width: 200px;
}

.alert-text strong {
  display: block;
  font-size: 1.1rem;
  color: #92400e;
  margin-bottom: 0.25rem;
}

.alert-text p {
  margin: 0;
  color: #a16207;
  font-size: 0.95rem;
}

.btn-renew {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f59e0b;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-renew:hover {
  background: #d97706;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .alert-content {
    flex-direction: column;
    text-align: center;
  }

  .btn-renew {
    width: 100%;
    justify-content: center;
  }
}
</style>
