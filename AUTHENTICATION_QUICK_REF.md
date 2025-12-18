# ⚡ Quick Reference - Authentification

## 🔑 Les 2 nouvelles méthodes

### ✅ checkEmail(email)
```typescript
const result = await checkEmail('user@email.com')

if (result.exists) {
  // Utilisateur existant → formulaire pré-rempli
  console.log(result.user)
} else {
  // Nouvel utilisateur → afficher formulaire enregistrement
}
```

### ✅ registerUser(email, password, firstName, lastName, phone)
```typescript
const result = await registerUser(
  'user@email.com',
  'password123!',
  'John',
  'Doe',
  '+33612345678'
)

if (result.success) {
  // Compte créé → formulaire pré-rempli
} else {
  // Erreur → afficher errorMessage
}
```

---

## 📊 États à suivre

```typescript
// Vérification d'email
emailCheckLoading    // true pendant vérification
emailCheckError      // Message erreur
userExists          // true si trouvé
existingUserData    // Données { email, firstName, lastName, phone }

// Enregistrement
isProcessing        // true pendant création
errorMessage        // Message erreur
```

---

## 🎯 Workflow simple

```vue
<template>
  <!-- Étape 1: Email check -->
  <form @submit.prevent="handleEmailCheck">
    <input v-model="email" type="email" />
    <button :disabled="emailCheckLoading">Vérifier</button>
  </form>

  <!-- Étape 2: Enregistrement (si nouveau) -->
  <form v-if="!userExists" @submit.prevent="handleRegister">
    <input v-model="password" type="password" />
    <!-- Autres champs... -->
    <button :disabled="isProcessing">Créer compte</button>
  </form>

  <!-- Étape 3: Sélection plan -->
  <div v-if="userExists || registrationComplete">
    <!-- Afficher plans... -->
  </div>
</template>

<script setup>
const { checkEmail, registerUser } = useSubscription()
const email = ref('')
const password = ref('')

const handleEmailCheck = async () => {
  await checkEmail(email.value)
}

const handleRegister = async () => {
  await registerUser(email.value, password.value, ...)
}
</script>
```

---

## 🔍 Vérifier les résultats en console

```javascript
// Après checkEmail()
console.log(userExists)              // true/false
console.log(existingUserData)        // { email, firstName, ... }
console.log(subscriptionForm.value)  // Pré-rempli

// Après registerUser()
console.log(isProcessing)            // false
console.log(errorMessage)            // "" si succès
console.log(subscriptionForm.value)  // Pré-rempli
```

---

## 💾 Fichiers modifiés: 2

| Fichier | Changements | Lignes |
|---------|-------------|--------|
| `composables/useSubscription.ts` | +checkEmail(), +registerUser(), +4 états | ~120 |
| `type/index.ts` | +3 interfaces | ~30 |

---

## 📚 Lire ensuite

1. `AUTHENTICATION_FLOW.md` - Détails complets
2. `AUTHENTICATION_EXAMPLES.vue` - Composant example
3. `AUTHENTICATION_SUMMARY.md` - Résumé détaillé

---

**C'est tout ce que vous devez savoir! 🚀**
