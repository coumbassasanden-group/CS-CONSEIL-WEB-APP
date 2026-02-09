<template>
  <div v-if="show" class="password-modal-overlay" @click.self="$emit('close')">
    <div class="password-modal">
      <button class="modal-close" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>

      <div class="password-modal-content">
        <div class="password-icon">
          <Icon icon="mdi:lock-open" />
        </div>
        <h3>Mot de passe du PDF</h3>
        <p class="password-hint">Ce mot de passe est necessaire pour ouvrir le fichier PDF telecharge.</p>

        <div class="password-display">
          <code class="password-value">{{ password }}</code>
          <button @click="copyPassword" class="btn-copy" :class="{ copied: copied }">
            <Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" />
            <span>{{ copied ? 'Copie !' : 'Copier' }}</span>
          </button>
        </div>

        <p class="password-note">
          <Icon icon="mdi:information-outline" />
          Conservez ce mot de passe, il sera necessaire a chaque ouverture du PDF.
        </p>

        <button @click="$emit('close')" class="btn-close-modal">
          J'ai note le mot de passe
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from "@iconify/vue"

const props = defineProps<{
  show: boolean
  password: string
}>()

const emit = defineEmits<{
  close: []
  copied: []
}>()

const copied = ref(false)

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(props.password)
    copied.value = true
    emit('copied')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // Fallback pour les navigateurs qui ne supportent pas clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = props.password
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    emit('copied')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.password-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.password-modal {
  background: white;
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  position: relative;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  color: #6b7280;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.password-modal-content {
  padding: 2.5rem;
  text-align: center;
}

.password-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  color: #059669;
}

.password-modal-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem;
}

.password-hint {
  color: #6b7280;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.password-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.password-value {
  flex: 1;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 2px;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: #d4b128;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-copy:hover {
  transform: translateY(-2px);
}

.btn-copy.copied {
  background: linear-gradient(135deg, #059669, #10b981);
}

.password-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0 0 1.5rem;
}

.btn-close-modal {
  width: 100%;
  padding: 1rem;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: #374151;
}
</style>
