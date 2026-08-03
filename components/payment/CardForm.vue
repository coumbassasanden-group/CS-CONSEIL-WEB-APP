<script setup lang="ts">
/**
 * Saisie d'une carte bancaire.
 *
 * ⚠️ Les valeurs saisies ici sont des données de porteur au sens PCI-DSS.
 * Elles ne doivent jamais être écrites dans `localStorage`, transmises à un
 * outil d'analyse, ni conservées après l'envoi. `reset()` les efface, et le
 * composant est monté sous `v-if` pour que Vue détruise l'état à la fermeture.
 *
 * Les champs portent `autocomplete` afin que le gestionnaire du navigateur
 * remplisse la carte lui-même — c'est plus sûr qu'une saisie manuelle.
 */

const model = defineModel<{
  cardNumber: string
  expiry: string
  cvv: string
  holderFirstName: string
  holderLastName: string
}>({ required: true })

defineProps<{ disabled?: boolean }>()

/** Groupe le numéro par blocs de quatre, sans altérer la valeur transmise. */
const onNumberInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 19)
  model.value.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim()
}

/** Force le format MM/AA au fil de la frappe. */
const onExpiryInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  model.value.expiry = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
}

const onCvvInput = (event: Event) => {
  model.value.cvv = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
}
</script>

<template>
  <div class="card-form">
    <div class="card-form-row">
      <label for="card-first-name">Prénom du titulaire</label>
      <input
        id="card-first-name"
        v-model="model.holderFirstName"
        type="text"
        autocomplete="cc-given-name"
        placeholder="John"
        :disabled="disabled"
      />
    </div>

    <div class="card-form-row">
      <label for="card-last-name">Nom du titulaire</label>
      <input
        id="card-last-name"
        v-model="model.holderLastName"
        type="text"
        autocomplete="cc-family-name"
        placeholder="Doe"
        :disabled="disabled"
      />
    </div>

    <div class="card-form-row">
      <label for="card-number">Numéro de carte</label>
      <input
        id="card-number"
        :value="model.cardNumber"
        type="text"
        inputmode="numeric"
        autocomplete="cc-number"
        placeholder="0000 0000 0000 0000"
        :disabled="disabled"
        @input="onNumberInput"
      />
    </div>

    <div class="card-form-inline">
      <div class="card-form-row">
        <label for="card-expiry">Expiration</label>
        <input
          id="card-expiry"
          :value="model.expiry"
          type="text"
          inputmode="numeric"
          autocomplete="cc-exp"
          placeholder="MM/AA"
          :disabled="disabled"
          @input="onExpiryInput"
        />
      </div>

      <div class="card-form-row">
        <label for="card-cvv">Cryptogramme</label>
        <input
          id="card-cvv"
          :value="model.cvv"
          type="text"
          inputmode="numeric"
          autocomplete="cc-csc"
          placeholder="123"
          :disabled="disabled"
          @input="onCvvInput"
        />
      </div>
    </div>

    <p class="card-form-note">
      Les trois ou quatre chiffres figurant au dos de votre carte.
    </p>
  </div>
</template>

<style scoped>
.card-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.card-form-inline {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.card-form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-form-row label {
  font-size: 13px;
  font-weight: 600;
  color: #1e2937;
}

.card-form-row input {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.card-form-row input:focus {
  border-color: #3761ff;
}

.card-form-row input:disabled {
  background: #eef2f7;
  cursor: not-allowed;
}

.card-form-note {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}
</style>
