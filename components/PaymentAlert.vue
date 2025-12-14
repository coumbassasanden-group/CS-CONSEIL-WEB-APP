<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="payment-modal-overlay" @click.self="$emit('close')">
        <div class="payment-modal">
          <!-- En-tête -->
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="btn-close" @click="$emit('close')" type="button">
              <span>×</span>
            </button>
          </div>

          <!-- Contenu -->
          <div class="modal-body">
            <div class="payment-icon" :class="type">
              <span v-if="type === 'success'">✓</span>
              <span v-else-if="type === 'error'">✕</span>
              <span v-else-if="type === 'warning'">⚠</span>
              <span v-else class="spinner-icon"></span>
            </div>

            <p class="payment-message">{{ message }}</p>

            <!-- Informations additionnelles -->
            <div v-if="details" class="payment-details">
              <div v-for="(value, key) in details" :key="key" class="detail-item">
                <span class="detail-label">{{ key }}</span>
                <span class="detail-value">{{ value }}</span>
              </div>
            </div>

            <!-- Progress bar pour le processing -->
            <div v-if="type === 'processing'" class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button
              v-if="type === 'success'"
              class="btn-primary"
              @click="$emit('confirm')"
              type="button"
            >
              Continuer
            </button>
            <button
              v-else-if="type === 'error'"
              class="btn-secondary"
              @click="$emit('retry')"
              type="button"
            >
              Réessayer
            </button>
            <button
              v-if="type !== 'processing'"
              class="btn-ghost"
              @click="$emit('close')"
              type="button"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  type: 'success' | 'error' | 'warning' | 'processing'
  title: string
  message: string
  details?: Record<string, string>
  progress?: number
}

withDefaults(defineProps<Props>(), {
  progress: 0
})

defineEmits<{
  close: []
  confirm: []
  retry: []
}>()
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.payment-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.5rem;
  color: #6b7280;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 2.5rem 2rem;
  text-align: center;
}

.payment-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  font-weight: bold;
}

.payment-icon.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  animation: successPop 0.5s ease;
}

.payment-icon.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  animation: errorShake 0.5s ease;
}

.payment-icon.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.payment-icon.processing {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

@keyframes successPop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.spinner-icon {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(139, 92, 46, 0.2);
  border-top-color: var(--cs-brown-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.payment-message {
  font-size: 1.1rem;
  color: #4b5563;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.payment-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--cs-brown-color);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary,
.btn-ghost {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-secondary {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f3f4f6;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-modal {
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .payment-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
}
</style>
