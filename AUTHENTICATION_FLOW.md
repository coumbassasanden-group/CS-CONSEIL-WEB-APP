# 🔐 Logique d'Authentification et Vérification d'Email

## 📋 Workflow complet

```
1. Utilisateur entre son email
                ↓
2. checkEmail(email)
                ↓
        Email existe?
         /          \
       OUI          NON
        |             |
   Pré-remplir   registerUser()
   le formulaire  (créer compte)
        |             |
        └─────┬───────┘
              ↓
      Formulaire prêt
              ↓
      Créer abonnement
```

---

## 🔍 Endpoints API intégrés

### 1️⃣ Vérifier si un email existe

**Endpoint:** `GET /check-email?email=<email>`

**Request:**
```bash
curl "http://localhost:3000/api/check-email?email=test@example.com"
```

**Response (Email existe):**
```json
{
  "exists": true,
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678"
}
```

**Response (Email n'existe pas):**
```json
{
  "exists": false,
  "email": "newuser@example.com"
}
```

---

### 2️⃣ Créer un nouvel utilisateur

**Endpoint:** `POST /auth/register`

**Request:**
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+33612345678"
  }'
```

**Payload:**
```typescript
{
  email: string          // Email unique
  password: string       // Mot de passe sécurisé (min 8 caractères)
  firstName: string      // Prénom
  lastName: string       // Nom
  phone: string          // Numéro de téléphone
}
```

**Response (Succès):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+33612345678",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-12-14T...",
    "updatedAt": "2025-12-14T..."
  }
}
```

**Response (Erreur):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

## 💻 Utilisation dans le composable

### Méthode 1: `checkEmail(email: string)`

Vérifie si un email existe et pré-remplit le formulaire si oui.

```typescript
const { checkEmail, userExists, existingUserData, subscriptionForm } = useSubscription()

// Vérifier un email
const result = await checkEmail('test@example.com')

if (result.exists) {
  console.log('Utilisateur trouvé:', result.user)
  console.log('Formulaire pré-rempli:', subscriptionForm.value)
  // userExists.value = true
  // existingUserData.value = { email, firstName, lastName, phone }
} else {
  console.log('Email n\'existe pas - prêt pour l\'enregistrement')
  // userExists.value = false
}
```

**États gérés automatiquement:**
- `emailCheckLoading` - Loading pendant la vérification
- `emailCheckError` - Message d'erreur s'il y a
- `userExists` - true si utilisateur trouvé
- `existingUserData` - Données de l'utilisateur existant
- `subscriptionForm` - Pré-rempli automatiquement!

---

### Méthode 2: `registerUser(email, password, firstName, lastName, phone)`

Crée un nouveau compte utilisateur.

```typescript
const { registerUser, isProcessing, errorMessage, subscriptionForm } = useSubscription()

// Créer un nouvel utilisateur
const result = await registerUser(
  'john.doe@example.com',
  'SecurePass123!',
  'John',
  'Doe',
  '+33612345678'
)

if (result.success) {
  console.log('Compte créé:', result.user)
  // Le formulaire est pré-rempli automatiquement!
  console.log('Formulaire:', subscriptionForm.value)
} else {
  console.log('Erreur:', result.error)
  console.log('Message d\'erreur:', errorMessage.value)
}
```

**États gérés automatiquement:**
- `isProcessing` - true pendant la création
- `errorMessage` - Message d'erreur détaillé
- `subscriptionForm` - Pré-rempli automatiquement!

---

## 🔄 Workflow complet d'inscription

### Étape 1: Vérification d'email

```vue
<template>
  <form @submit.prevent="handleEmailCheck">
    <input 
      v-model="emailInput" 
      type="email" 
      placeholder="Votre email"
    />
    <button :disabled="emailCheckLoading">
      {{ emailCheckLoading ? 'Vérification...' : 'Continuer' }}
    </button>

    <!-- Affichage des erreurs -->
    <div v-if="emailCheckError" class="error">
      {{ emailCheckError }}
    </div>

    <!-- Affichage des résultats -->
    <div v-if="userExists" class="info">
      Bienvenue {{ existingUserData.firstName }}! 
      Votre profil a été pré-rempli.
    </div>
  </form>
</template>

<script setup lang="ts">
const { checkEmail, userExists, emailCheckLoading, emailCheckError, existingUserData } = useSubscription()
const emailInput = ref('')

const handleEmailCheck = async () => {
  const result = await checkEmail(emailInput.value)
  
  if (!result.exists && !result.error) {
    // Email n'existe pas - l'utilisateur doit créer un compte
    showRegistrationForm.value = true
  }
  // Si exists = true, le formulaire est déjà pré-rempli
}
</script>
```

---

### Étape 2: Enregistrement (si nouvel utilisateur)

```vue
<template>
  <form 
    v-if="!userExists && !emailCheckLoading" 
    @submit.prevent="handleRegister"
  >
    <input 
      v-model="subscriptionForm.email" 
      type="email" 
      disabled
      placeholder="Email"
    />
    <input 
      v-model="password" 
      type="password" 
      placeholder="Mot de passe"
      minlength="8"
    />
    <input 
      v-model="subscriptionForm.firstName" 
      type="text" 
      placeholder="Prénom"
    />
    <input 
      v-model="subscriptionForm.lastName" 
      type="text" 
      placeholder="Nom"
    />
    <input 
      v-model="subscriptionForm.phone" 
      type="tel" 
      placeholder="Téléphone"
    />
    <button :disabled="isProcessing">
      {{ isProcessing ? 'Création du compte...' : 'Créer mon compte' }}
    </button>

    <!-- Affichage des erreurs -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </form>
</template>

<script setup lang="ts">
const { registerUser, subscriptionForm, isProcessing, errorMessage, userExists } = useSubscription()
const password = ref('')

const handleRegister = async () => {
  const result = await registerUser(
    subscriptionForm.value.email,
    password.value,
    subscriptionForm.value.firstName,
    subscriptionForm.value.lastName,
    subscriptionForm.value.phone
  )

  if (result.success) {
    // Compte créé, passer à la sélection du plan
    showPlanSelection.value = true
  }
}
</script>
```

---

### Étape 3: Sélection du plan et abonnement

```vue
<template>
  <div v-if="userExists || registrationComplete">
    <!-- Plans d'abonnement -->
    <div v-for="plan in subscriptionPlans" :key="plan.id">
      <h3>{{ plan.name }}</h3>
      <p>{{ formatPrice(plan.price) }}</p>
      <button @click="selectPlan(plan.id)">
        Choisir ce plan
      </button>
    </div>

    <!-- Bouton pour confirmer et créer l'abonnement -->
    <button @click="handleCreateSubscription">
      Souscrire à {{ getSelectedPlan?.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { 
  selectPlan, 
  createSubscription, 
  subscriptionPlans, 
  getSelectedPlan,
  formatPrice,
  userExists
} = useSubscription()

const handleCreateSubscription = async () => {
  const success = await createSubscription()
  if (success) {
    // Redirection vers confirmation
  }
}
</script>
```

---

## 📊 États du composable

### Email Check
```typescript
emailCheckLoading: boolean      // Loading pendant vérification
emailCheckError: string         // Message d'erreur
userExists: boolean             // true si email existe
existingUserData: any           // Données de l'utilisateur si existe
```

### Enregistrement
```typescript
isProcessing: boolean           // Loading pendant création compte
errorMessage: string            // Message d'erreur détaillé
subscriptionForm: {
  email: string                 // Pré-rempli après check
  firstName: string             // Pré-rempli après check
  lastName: string              // Pré-rempli après check
  phone: string                 // Pré-rempli après check
  // ... autres champs
}
```

---

## ⚡ Exemple complet minimaliste

```vue
<template>
  <div class="subscription-flow">
    <!-- ÉTAPE 1: Email Check -->
    <div v-if="step === 'email'" class="email-check">
      <h2>Vérifications de votre email</h2>
      <input 
        v-model="email" 
        type="email" 
        placeholder="Votre email"
      />
      <button @click="handleEmailCheck" :disabled="emailCheckLoading">
        {{ emailCheckLoading ? 'Vérification...' : 'Continuer' }}
      </button>
      <p v-if="emailCheckError" class="error">{{ emailCheckError }}</p>
    </div>

    <!-- ÉTAPE 2: Enregistrement (si nouvel utilisateur) -->
    <div v-if="step === 'register' && !userExists" class="register">
      <h2>Créer votre compte</h2>
      <input v-model="password" type="password" placeholder="Mot de passe" />
      <button @click="handleRegister" :disabled="isProcessing">
        {{ isProcessing ? 'Création...' : 'Créer mon compte' }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <!-- ÉTAPE 3: Sélection du plan -->
    <div v-if="step === 'plans'" class="plans">
      <h2>Choisir votre plan</h2>
      <button 
        v-for="plan in subscriptionPlans" 
        :key="plan.id"
        @click="selectPlan(plan.id)"
      >
        {{ plan.name }} - {{ formatPrice(plan.price) }}
      </button>
      <button @click="handleCreateSubscription">
        Souscrire
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const step = ref<'email' | 'register' | 'plans'>('email')

const {
  checkEmail,
  registerUser,
  selectPlan,
  createSubscription,
  subscriptionPlans,
  subscriptionForm,
  userExists,
  emailCheckLoading,
  emailCheckError,
  isProcessing,
  errorMessage,
  formatPrice
} = useSubscription()

const handleEmailCheck = async () => {
  const result = await checkEmail(email.value)
  step.value = userExists.value || result.exists ? 'plans' : 'register'
}

const handleRegister = async () => {
  await registerUser(
    email.value,
    password.value,
    subscriptionForm.value.firstName,
    subscriptionForm.value.lastName,
    subscriptionForm.value.phone
  )
  step.value = 'plans'
}

const handleCreateSubscription = async () => {
  await createSubscription()
  // Redirection...
}
</script>
```

---

## 🎯 Points clés

✅ **Logique automatisée:**
- Email existe? → Pré-remplissage automatique
- Email n'existe pas? → Formulaire d'enregistrement
- Compte créé? → Pré-remplissage automatique

✅ **États gérés:**
- `emailCheckLoading`, `emailCheckError`
- `isProcessing`, `errorMessage`
- `userExists`, `existingUserData`

✅ **Pré-remplissage automatique:**
- Après `checkEmail()` si utilisateur existe
- Après `registerUser()` si création réussie

✅ **Type-safe:**
- Types TypeScript complètement définis
- Validation des payloads

---

## 📝 Fichiers modifiés

- ✅ `composables/useSubscription.ts` - Méthodes `checkEmail()` et `registerUser()`
- ✅ `type/index.ts` - Types `CheckEmailResponse`, `RegisterPayload`, `RegisterResponse`

---

**Prêt à tester! 🚀**
