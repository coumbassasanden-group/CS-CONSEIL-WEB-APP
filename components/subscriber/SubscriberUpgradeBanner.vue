<template>
  <div class="upgrade-banner">
    <div class="upgrade-banner-content">
      <Icon icon="mdi:star" class="banner-icon" />
      <div class="banner-text">
        <h4>Passez a Premium et economisez !</h4>
        <p>Abonnement annuel a 20 000 FCFA - Acces a toutes les editions</p>
      </div>
      <NuxtLink :to="upgradeLink" class="btn-upgrade-small">
        Mettre a niveau
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

defineProps<{
  upgradeLink: string
}>()
</script>

<style scoped>
.upgrade-banner {
  margin-top: 2rem;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border: 2px solid #d4b128;
  border-radius: 16px;
  padding: 1.5rem;
}

.upgrade-banner-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.banner-icon {
  font-size: 2.5rem;
  color: #d4b128;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  min-width: 200px;
}

.banner-text h4 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.banner-text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.btn-upgrade-small {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #d4b128;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-upgrade-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

@media (max-width: 768px) {
  .upgrade-banner-content {
    flex-direction: column;
    text-align: center;
  }

  .btn-upgrade-small {
    width: 100%;
    justify-content: center;
  }
}
</style>
