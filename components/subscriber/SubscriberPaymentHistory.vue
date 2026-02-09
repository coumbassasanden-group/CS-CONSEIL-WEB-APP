<template>
  <div class="payments-section">
    <div class="section-header">
      <h2><Icon icon="mdi:receipt-text" /> Historique des Paiements</h2>
      <p>Consultez l'historique de tous vos paiements</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Chargement de l'historique...</p>
    </div>

    <div v-else-if="payments.length === 0" class="empty-state-small">
      <Icon icon="mdi:receipt-text-outline" class="empty-icon" />
      <h3>Aucun paiement enregistre</h3>
      <p>Votre historique de paiements apparaitra ici.</p>
    </div>

    <div v-else class="payments-list">
      <div class="payments-table-wrapper">
        <table class="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td class="date-cell">{{ formatDate(payment.date) }}</td>
              <td class="desc-cell">
                <div class="payment-desc">
                  <Icon :icon="getPaymentIcon(payment.type)" />
                  <span>{{ payment.description }}</span>
                </div>
              </td>
              <td class="amount-cell">{{ formatPrice(payment.amount) }}</td>
              <td class="status-cell">
                <span class="payment-status" :class="payment.status">
                  {{ getStatusLabel(payment.status) }}
                </span>
              </td>
              <td class="action-cell">
                <button v-if="payment.invoiceUrl" @click="$emit('downloadInvoice', payment)" class="btn-invoice">
                  <Icon icon="mdi:file-pdf-box" /> Facture
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div class="payments-summary">
        <div class="summary-item">
          <span class="summary-label">Total depense</span>
          <span class="summary-value">{{ formatPrice(totalSpent) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface Payment {
  id: number | string
  date: string
  description: string
  amount: number
  type: string
  status: string
  invoiceUrl?: string
}

defineProps<{
  payments: Payment[]
  loading: boolean
  totalSpent: number
  formatDate: (date: any) => string
  formatPrice: (amount: number) => string
}>()

defineEmits<{
  downloadInvoice: [payment: Payment]
}>()

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'subscription': return 'mdi:card-account-details'
    case 'single': return 'mdi:newspaper'
    case 'renewal': return 'mdi:refresh'
    default: return 'mdi:cash'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Paye'
    case 'pending': return 'En attente'
    case 'failed': return 'Echoue'
    case 'refunded': return 'Rembourse'
    default: return status
  }
}
</script>

<style scoped>
.payments-section {
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
  margin: 0;
}

.payments-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.payments-table-wrapper {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th,
.payments-table td {
  padding: 1rem 1.25rem;
  text-align: left;
}

.payments-table th {
  background: #f9fafb;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 2px solid #e5e7eb;
}

.payments-table td {
  border-bottom: 1px solid #f3f4f6;
}

.payments-table tr:last-child td {
  border-bottom: none;
}

.date-cell {
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
}

.payment-desc {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1f2937;
}

.payment-desc svg {
  font-size: 1.25rem;
  color: #d4b128;
}

.amount-cell {
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

.payment-status {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.payment-status.completed {
  background: #d1fae5;
  color: #059669;
}

.payment-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.payment-status.failed {
  background: #fee2e2;
  color: #dc2626;
}

.payment-status.refunded {
  background: #dbeafe;
  color: #2563eb;
}

.btn-invoice {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-invoice:hover {
  background: #e5e7eb;
}

.payments-summary {
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 2px solid #e5e7eb;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
}

@media (max-width: 768px) {
  .payments-table th,
  .payments-table td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .payment-desc span {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
