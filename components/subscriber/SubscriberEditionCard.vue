<template>
  <div class="edition-card" :class="[variant, { locked: isLocked }]">
    <div class="edition-image">
      <img :src="imageUrl" :alt="edition.title" />
      <span class="edition-badge" :class="badgeClass">{{ badgeText }}</span>
      <button
        @click.stop="$emit('toggleFavorite', edition.id)"
        class="btn-favorite"
        :class="{ active: isFavorite }"
        :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      >
        <Icon :icon="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
      </button>
      <div v-if="isLocked" class="edition-lock-overlay">
        <Icon icon="mdi:lock" />
      </div>
    </div>
    <div class="edition-content">
      <span class="edition-date">{{ formattedDate }}</span>
      <h3 class="edition-title">{{ edition.title }}</h3>

      <!-- Actions standard -->
      <div v-if="!isLocked || isPurchased" class="edition-actions">
        <button @click="$emit('view', edition)" class="btn-view btn-view-full">
          <Icon icon="mdi:eye" /> Consulter
        </button>
      </div>

      <!-- Actions pour edition verrouillée -->
      <div v-else class="edition-actions">
        <button @click="$emit('buy', edition)" class="btn-buy">
          <Icon icon="mdi:cart" /> Acheter ({{ unitPrice }} FCFA)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from "@iconify/vue"

interface Edition {
  id: number | string
  title: string
  date?: string
  image?: string
  purchaseDate?: string
  is_free?: boolean
  type?: string
}

const props = defineProps<{
  edition: Edition
  variant: 'free' | 'premium' | 'purchased'
  apiBaseUrl: string
  isFavorite: boolean
  isDownloading: boolean
  isLocked?: boolean
  isPurchased?: boolean
  unitPrice?: string
  formatDate: (date: any) => string
}>()

defineEmits<{
  view: [edition: Edition]
  download: [edition: Edition]
  buy: [edition: Edition]
  toggleFavorite: [id: number | string]
}>()

const imageUrl = computed(() => {
  const img = props.edition.image
  if (!img) return '/placeholder.jpg'
  return img.startsWith('http') ? img : `${props.apiBaseUrl}/storage/${img}`
})

const formattedDate = computed(() => {
  const date = props.edition.purchaseDate || props.edition.date
  return props.formatDate(date)
})

const badgeClass = computed(() => props.variant)

const badgeText = computed(() => {
  switch (props.variant) {
    case 'free': return 'Gratuit'
    case 'premium': return 'Premium'
    case 'purchased': return 'Achete'
    default: return ''
  }
})
</script>

<style scoped>
.edition-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.edition-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.edition-card.locked {
  opacity: 0.9;
}

.edition-image {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.edition-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.edition-card:hover .edition-image img {
  transform: scale(1.05);
}

.edition-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
}

.edition-badge.free {
  background: linear-gradient(135deg, #9E73B0, #7B1FA2);
  color: white;
}

.edition-badge.premium {
  background: #d4b128;
  color: white;
}

.edition-badge.purchased {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-favorite {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #9ca3af;
  font-size: 1.2rem;
}

.btn-favorite:hover {
  background: white;
  transform: scale(1.1);
}

.btn-favorite.active {
  color: #ef4444;
}

.edition-lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
}

.edition-content {
  padding: 1.25rem;
}

.edition-date {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.edition-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.edition-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-view,
.btn-download,
.btn-buy {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-view-full {
  width: 100%;
}

.btn-download {
  background: #d4b128;
  color: white;
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 177, 40, 0.3);
}

.btn-download:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-buy {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  flex: none;
  width: 100%;
}

.btn-buy:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
