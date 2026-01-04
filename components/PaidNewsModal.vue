<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <!-- Header avec bouton fermeture -->
          <div class="modal-header">
            <h2 class="modal-title">{{ news?.frTitle || news?.enTitle || 'Article' }}</h2>
            <button class="modal-close-btn" @click="closeModal" aria-label="Fermer">
              <span>✕</span>
            </button>
          </div>

          <!-- Body du modal avec le composant detailNew -->
          <div class="modal-body">
            <detailNew v-if="news?.id" :id="news.id" is-paid />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TSubscriptionData } from '~/type'

interface PaidNewsItem {
  id: number | string
  frTitle?: string
  enTitle?: string
  frContent?: string
  enContent?: string
  imageUrl?: string
  publishedAt?: string
  status?: string
}

const props = defineProps<{
  modelValue: boolean
  news: PaidNewsItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'download': [newsId: number | string]
  'share': [newsId: number | string]
}>()

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleDownload = () => {
  if (props.news?.id) {
    emit('download', props.news.id)
  }
}

const handleShare = () => {
  if (props.news?.id) {
    emit('share', props.news.id)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--cs-brown-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    border-radius: 16px;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem;
    flex-direction: column;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 1rem;
  }
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
