<template>
  <Transition name="toast">
    <div v-if="toast.visible" :class="['toast', toast.type]">
      <Icon :icon="toast.type === 'success' ? 'mdi:check-circle' : toast.type === 'error' ? 'mdi:alert-circle' : 'mdi:information'" />
      <span>{{ toast.message }}</span>
      <button @click="$emit('close')" class="toast-close">
        <Icon icon="mdi:close" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
  visible: boolean
}

defineProps<{
  toast: Toast
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  max-width: 400px;
  font-weight: 600;
}

.toast.success {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.toast.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.toast.info {
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: auto;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
