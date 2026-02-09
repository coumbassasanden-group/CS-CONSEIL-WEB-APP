<template>
  <div v-if="show" class="payment-modal-overlay" @click.self="$emit('close')">
    <div class="payment-modal">
      <button class="modal-close" @click="$emit('close')">
        <Icon icon="mdi:close" />
      </button>

      <div class="modal-header">
        <Icon icon="mdi:cart-check" class="modal-icon" />
        <h2>Acheter cette edition</h2>
      </div>

      <div class="modal-body">
        <div v-if="edition" class="edition-preview">
          <img :src="imageUrl" :alt="edition.title" />
          <div class="edition-info">
            <h3>{{ edition.title }}</h3>
            <p class="edition-price">{{ formatPrice(unitPrice) }}</p>
          </div>
        </div>

        <!-- Champ telephone -->
        <div class="phone-input-wrapper">
          <label for="phone" class="phone-label">
            <Icon icon="mdi:phone" /> Numero de telephone
          </label>
          <input
            type="tel"
            id="phone"
            v-model="phoneNumber"
            placeholder="Ex: 0701020304"
            class="phone-input"
            :class="{ 'has-error': phoneError }"
          />
          <p v-if="phoneError" class="phone-error">{{ phoneError }}</p>
        </div>

        <div class="payment-summary">
          <div class="summary-row">
            <span>Prix de l'edition</span>
            <span>{{ formatPrice(unitPrice) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total a payer</span>
            <span>{{ formatPrice(unitPrice) }}</span>
          </div>
        </div>

        <slot name="payment-provider"></slot>

        <button @click="handlePay" class="btn-pay" :disabled="!isPhoneValid">
          <Icon icon="mdi:credit-card" />
          Payer {{ formatPrice(unitPrice) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from "@iconify/vue"

interface Edition {
  id: number | string
  title: string
  image?: string
}

const props = defineProps<{
  show: boolean
  edition: Edition | null
  unitPrice: number
  apiBaseUrl: string
  formatPrice: (price: number) => string
  initialPhone?: string
}>()

const emit = defineEmits<{
  close: []
  pay: [phone: string]
}>()

// Phone state
const phoneNumber = ref(props.initialPhone || '')
const phoneError = ref('')

// Reset phone when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    phoneNumber.value = props.initialPhone || ''
    phoneError.value = ''
  }
})

// Validate phone
const isPhoneValid = computed(() => {
  const phone = phoneNumber.value.trim()
  return phone.length >= 8
})

// Handle pay click
const handlePay = () => {
  const phone = phoneNumber.value.trim()

  if (!phone) {
    phoneError.value = 'Veuillez entrer votre numero de telephone'
    return
  }

  if (phone.length < 8) {
    phoneError.value = 'Le numero doit contenir au moins 8 chiffres'
    return
  }

  phoneError.value = ''
  emit('pay', phone)
}

const imageUrl = computed(() => {
  if (!props.edition?.image) return '/placeholder.jpg'
  const img = props.edition.image
  return img.startsWith('http') ? img : `${props.apiBaseUrl}/storage/${img}`
})
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.payment-modal {
  background: white;
  border-radius: 20px;
  max-width: 480px;
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
  z-index: 10;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
}

.modal-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 0 2rem 2rem;
}

.edition-preview {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.edition-preview img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.edition-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.edition-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.edition-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #10b981;
  margin: 0;
}

.payment-summary {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.summary-row.total {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-pay {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Phone input styles */
.phone-input-wrapper {
  margin-bottom: 1.5rem;
}

.phone-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.phone-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.phone-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.phone-input.has-error {
  border-color: #ef4444;
}

.phone-input::placeholder {
  color: #9ca3af;
}

.phone-error {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #ef4444;
}

@media (max-width: 480px) {
  .edition-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .edition-preview img {
    width: 100px;
    height: 130px;
  }
}
</style>
