<template>
  <div class="subscription-form">
    <div class="form-header">
      <h3>Informations personnelles</h3>
      <p>Complétez vos informations pour finaliser votre abonnement</p>
    </div>

    <form @submit.prevent="$emit('submit')">
      <!-- Nom et Prénom -->
      <div class="form-row">
        <div class="form-group">
          <label for="firstName">
            Prénom <span class="required">*</span>
          </label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            placeholder="Jean"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="lastName">
            Nom <span class="required">*</span>
          </label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            placeholder="Dupont"
            required
            class="form-input"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">
          Email <span class="required">*</span>
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="jean.dupont@example.com"
          required
          class="form-input"
        />
      </div>

      <!-- Téléphone -->
      <div class="form-group">
        <label for="phone">Téléphone</label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          class="form-input"
        />
      </div>

      <!-- Entreprise (optionnel) -->
      <div class="form-group">
        <label for="company">Entreprise (optionnel)</label>
        <input
          id="company"
          v-model="formData.company"
          type="text"
          placeholder="Nom de votre entreprise"
          class="form-input"
        />
      </div>

      <!-- Justificatif étudiant (si plan étudiant sélectionné) -->
      <div v-if="selectedPlan?.requiresProof" class="form-group">
        <label for="studentProof">
          Justificatif étudiant <span class="required">*</span>
        </label>
        <div class="file-input-wrapper">
          <input
            id="studentProof"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileUpload"
            class="file-input"
            :required="selectedPlan?.requiresProof"
          />
          <div class="file-input-label">
            <span class="upload-icon">📎</span>
            <span v-if="!formData.studentProof">
              Carte d'étudiant ou certificat de scolarité (PDF, JPG, PNG)
            </span>
            <span v-else class="file-name">
              ✓ {{ formData.studentProof.name }}
            </span>
          </div>
        </div>
        <p class="help-text">
          {{ selectedPlan.validation }}
        </p>
      </div>

      <!-- Conditions -->
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            v-model="formData.acceptTerms"
            type="checkbox"
            required
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">
            J'accepte les <a href="#" class="link">conditions générales</a> et la 
            <a href="#" class="link">politique de confidentialité</a> 
            <span class="required">*</span>
          </span>
        </label>
      </div>

      <!-- Newsletter -->
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            v-model="formData.newsletter"
            type="checkbox"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">
            Je souhaite recevoir la newsletter et les offres spéciales
          </span>
        </label>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- Résumé du plan sélectionné -->
      <div v-if="selectedPlan" class="plan-summary">
        <div class="summary-header">
          <span class="summary-icon">{{ selectedPlan.icon }}</span>
          <div>
            <h4>{{ selectedPlan.name }}</h4>
            <p>Plan sélectionné</p>
          </div>
        </div>
        <div class="summary-price">
          <span class="price-amount">{{ formatPrice(selectedPlan.price) }}</span>
          <span class="price-period">/ {{ selectedPlan.period === 'month' ? 'mois' : 'an' }}</span>
        </div>
      </div>

      <!-- Bouton de soumission -->
      <button 
        type="submit" 
        class="btn-submit"
        :disabled="isProcessing || !formData.acceptTerms"
      >
        <span v-if="isProcessing" class="spinner"></span>
        <span v-else>Procéder au paiement</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  studentProof: File | null
  acceptTerms: boolean
  newsletter: boolean
}

interface Plan {
  id: number
  name: string
  price: number
  currency: string
  period: string
  icon: string
  validation?: string
  requiresProof?: boolean
}

interface Props {
  formData: FormData
  selectedPlan: Plan | null
  isProcessing?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
  error: ''
})

defineEmits<{
  submit: []
}>()

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    props.formData.studentProof = target.files[0]
  }
}

const formatPrice = (price: number) => {
  if (price === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
}
</script>

<style scoped>
.subscription-form {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: var(--cs-brown-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 46, 0.1);
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 60px;
}

.file-input-wrapper:hover .file-input-label {
  border-color: var(--cs-brown-color);
  background: #fef7f0;
}

.upload-icon {
  font-size: 1.5rem;
}

.file-name {
  color: #16a34a;
  font-weight: 600;
}

.help-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-style: italic;
}

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
  padding-left: 2rem;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  position: absolute;
  left: 0;
  top: 2px;
  height: 20px;
  width: 20px;
  background-color: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.checkbox-input:checked ~ .checkbox-custom {
  background-color: var(--cs-brown-color);
  border-color: var(--cs-brown-color);
}

.checkbox-input:checked ~ .checkbox-custom::after {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-text {
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
}

.link {
  color: var(--cs-brown-color);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #991b1b;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.2rem;
}

.plan-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef7f0 0%, #fef3e7 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 2px solid #f5d7b8;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  font-size: 2rem;
}

.summary-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.summary-header p {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.summary-price {
  text-align: right;
}

.price-amount {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--cs-brown-color);
  display: block;
}

.price-period {
  font-size: 0.85rem;
  color: #64748b;
}

.btn-submit {
  width: 100%;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--cs-brown-color);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 46, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 46, 0.4);
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .subscription-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-header h3 {
    font-size: 1.5rem;
  }

  .plan-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .summary-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
