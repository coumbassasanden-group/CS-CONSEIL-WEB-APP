<template>
  <div class="editions-section">
    <div class="section-header">
      <h2><Icon :icon="headerIcon" /> {{ title }}</h2>
      <p>{{ subtitle }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Chargement des éditions...</p>
    </div>

    <!-- Empty State - No editions -->
    <div v-else-if="editions.length === 0 && !searchQuery" class="empty-state-small">
      <Icon icon="mdi:newspaper-variant-outline" class="empty-icon" />
      <h3>{{ emptyTitle }}</h3>
      <p>{{ emptyDescription }}</p>
      <NuxtLink v-if="browseLink" :to="browseLink" class="btn-browse">
        <Icon icon="mdi:newspaper" /> Parcourir les editions
      </NuxtLink>
    </div>

    <!-- Empty State - No search results -->
    <div v-else-if="editions.length === 0 && searchQuery" class="empty-state-small">
      <Icon icon="mdi:magnify" class="empty-icon" />
      <h3>Aucun resultat</h3>
      <p>Aucune edition ne correspond a "{{ searchQuery }}"</p>
      <button @click="$emit('clearSearch')" class="btn-browse">
        <Icon icon="mdi:close" /> Effacer la recherche
      </button>
    </div>

    <!-- Editions Grid -->
    <div v-else class="editions-grid">
      <SubscriberEditionCard
        v-for="edition in editions"
        :key="edition.id"
        :edition="edition"
        :variant="variant"
        :api-base-url="apiBaseUrl"
        :is-favorite="isFavorite(edition.id)"
        :is-downloading="downloadingId === edition.id"
        :is-locked="isLocked ? isLocked(edition) : false"
        :is-purchased="isPurchased ? isPurchased(edition.id) : false"
        :unit-price="unitPrice"
        :format-date="formatDate"
        @view="$emit('view', $event)"
        @download="$emit('download', $event)"
        @buy="$emit('buy', $event)"
        @toggle-favorite="$emit('toggleFavorite', $event)"
      />
    </div>

    <!-- Upgrade Banner -->
    <slot name="upgrade-banner"></slot>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface Edition {
  id: number | string
  title: string
  date?: string
  image?: string
  is_free?: boolean
  type?: string
}

defineProps<{
  title: string
  subtitle: string
  headerIcon: string
  editions: Edition[]
  variant: 'free' | 'premium' | 'purchased'
  loading: boolean
  searchQuery: string
  emptyTitle: string
  emptyDescription: string
  browseLink?: string
  apiBaseUrl: string
  downloadingId: number | string | null
  unitPrice?: string
  isFavorite: (id: number | string) => boolean
  isLocked?: (edition: Edition) => boolean
  isPurchased?: (id: number | string) => boolean
  formatDate: (date: any) => string
}>()

defineEmits<{
  view: [edition: Edition]
  download: [edition: Edition]
  buy: [edition: Edition]
  toggleFavorite: [id: number | string]
  clearSearch: []
}>()
</script>

<style scoped>
.editions-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.section-header p {
  color: #6b7280;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #d4b128;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: 1rem;
  color: #6b7280;
}

.empty-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state-small h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4b5563;
  margin: 0 0 0.5rem;
}

.empty-state-small p {
  color: #9ca3af;
  margin: 0 0 1.5rem;
}

.btn-browse {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #d4b128;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-browse:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

.editions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .editions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
