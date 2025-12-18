# 📧 Flux d'inscription "Email en Premier"

## 🎯 Vue d'ensemble

Le formulaire d'abonnement a été remplacé par un flux intelligent qui **demande l'email en premier** et **pré-remplit automatiquement** les champs si l'utilisateur existe déjà.

### Composants impliqués

| Fichier | Rôle |
|---------|------|
| `components/SubscriptionFormEmail.vue` | Formulaire principal (🆕) |
| `pages/subscriber/index.vue` | Page d'abonnement (modifiée) |
| `composables/useSubscription.ts` | Logique métier |

---

## 🔄 Flux détaillé

```
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: VÉRIFICATION EMAIL                             │
├─────────────────────────────────────────────────────────┤
│  • Champ email obligatoire                              │
│  • Appelle checkEmail() sur validation                  │
│  • Loading state pendant la vérification                │
└─────────────────────────────────────────────────────────┘
            ↓
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ Existe   │  │ N'existe │
│          │  │ pas      │
└──────────┘  └──────────┘
     │             │
     ▼             ▼
 ┌─────────────────┐  ┌──────────────────┐
 │ ÉTAPE 2A        │  │ ÉTAPE 2B         │
 │ UTILISATEUR     │  │ NOUVEL           │
 │ EXISTANT        │  │ UTILISATEUR      │
 │                 │  │                  │
 │ Afficher        │  │ Formulaire       │
 │ les infos       │  │ d'enregistrement │
 │ pré-remplies    │  │ (pwd, nom, tel)  │
 │                 │  │                  │
 │ Boutons:        │  │ Appelle          │
 │ • Continuer     │  │ registerUser()   │
 │ • Modifier      │  │                  │
 └─────────────────┘  └──────────────────┘
     │                      │
     ├──→ Modification      │
     │    des infos         │
     │                      │
     └──────────┬───────────┘
                ▼
   ┌─────────────────────────┐
   │ ÉTAPE 4: CHOISIR PLAN   │
   │                         │
   │ • Grille de 3 plans     │
   │ • Sélection (click)     │
   │ • Bouton finaliser      │
   └─────────────────────────┘
                ▼
   ┌─────────────────────────┐
   │ ÉTAPE 5: CONFIRMATION   │
   │                         │
   │ Afficher résumé         │
   │ + bouton "Accéder compte"
   └─────────────────────────┘
```

---

## 📋 Étape 1: Vérification email

**Composant:**
```vue
<section v-if="currentStep === 'email-check'" class="step email-check-step">
```

**Comportement:**
- ✉️ Un champ email unique
- 🔍 Vérification via `checkEmail(email)`
- ⟳ Loading state pendant la vérification
- ⚠️ Affichage des erreurs

**API appelée:**
```
GET /api/auth/check-email?email=user@example.com
```

**Réponse:**
```json
{
  "exists": true,
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678"
}
```

---

## 👤 Étape 2A: Utilisateur existant

**Composant:**
```vue
<section v-if="currentStep === 'existing-user' && userExists" class="step">
```

**Affichage:**
- ✓ Carte affichant les informations retrouvées
- Pré-remplissage automatique de `subscriptionForm`
- Deux boutons d'action:
  - ✓ **Continuer** → Aller à la sélection de plan
  - ✎ **Modifier** → Éditer les informations

**Code:**
```typescript
const proceedToPlans = () => {
  originalUserData.value = { ...subscriptionForm.value }
  currentStep.value = 'select-plan'
}

const editProfile = () => {
  originalUserData.value = { ...subscriptionForm.value }
  currentStep.value = 'edit-profile'
}
```

---

## 🆕 Étape 2B: Nouvel utilisateur

**Composant:**
```vue
<section v-if="currentStep === 'new-user' && !userExists" class="step">
```

**Formulaire:**
- 📧 Email (non modifiable, pré-rempli)
- 🔐 Mot de passe (min 8 caractères)
- 👤 Prénom et Nom
- 📞 Téléphone

**Soumission:**
```typescript
const handleRegistration = async () => {
  const result = await registerUser(
    subscriptionForm.value.email,
    password.value,
    subscriptionForm.value.firstName,
    subscriptionForm.value.lastName,
    subscriptionForm.value.phone
  )

  if (result.success) {
    currentStep.value = 'select-plan'
  }
}
```

**API appelée:**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "secure_password",
  "firstName": "Marie",
  "lastName": "Martin",
  "phone": "+33698765432"
}
```

---

## ✏️ Étape 3: Modification du profil

**Composant:**
```vue
<section v-if="currentStep === 'edit-profile'" class="step">
```

**Fonctionnalité:**
- Formulaire de modification
- Champs modifiables: Prénom, Nom, Téléphone
- Email non modifiable
- Boutons:
  - ✓ Enregistrer les modifications
  - Annuler (restaure les données originales)

**Code:**
```typescript
const handleEditProfile = () => {
  currentStep.value = 'existing-user'
}

const cancelEdit = () => {
  if (originalUserData.value) {
    Object.assign(subscriptionForm.value, originalUserData.value)
  }
  currentStep.value = 'existing-user'
}
```

---

## 🎁 Étape 4: Sélection du plan

**Composant:**
```vue
<section v-if="currentStep === 'select-plan'" class="step">
```

**Affichage:**
- 📊 Grille de 3 plans récupérés via `fetchPlans()`
- Chaque plan affiche:
  - 🏷️ Nom du plan
  - 💰 Prix formaté
  - 📝 Description
  - ✓ Liste des features
  - Bouton de sélection

**Interaction:**
```typescript
const selectPlan = (planId: string) => {
  subscriptionForm.value.planId = planId
}

const handleCreateSubscription = async () => {
  const success = await createSubscription({})
  if (success) {
    currentStep.value = 'confirmation'
  }
}
```

---

## ✅ Étape 5: Confirmation

**Composant:**
```vue
<section v-if="currentStep === 'confirmation'" class="step">
```

**Affichage:**
- ✓ Boîte de succès verte
- 📋 Détails de l'abonnement:
  - Utilisateur (Prénom Nom)
  - Email
  - Plan sélectionné
- Message confirmant l'envoi d'email
- Bouton pour accéder au compte

---

## 🎨 Styling intégré

Le composant utilise **le design system existant** :

### Variables CSS
```css
--cs-brown-color: #8b5c2e  /* Couleur principale */
```

### Classes de base
- `.form-control` - Champs de saisie
- `.btn`, `.btn-primary`, `.btn-secondary` - Boutons
- `.alert`, `.alert-error` - Alertes

### Responsive
```
Mobile (≤768px):
- Une colonne pour form-row
- Padding réduit
- Boutons en colonne
```

---

## 🔧 États de composant

### Variables locales
```typescript
const currentStep = ref<'email-check' | 'existing-user' | 'new-user' | 
                    'edit-profile' | 'select-plan' | 'confirmation'>('email-check')
const emailInput = ref('')
const password = ref('')
const originalUserData = ref<any>(null)
```

### États du composable
```typescript
// Email Check
emailCheckLoading
emailCheckError
userExists
existingUserData

// Registration
isProcessing
errorMessage
subscriptionForm

// Plans
subscriptionPlans
plansLoading
plansError
getSelectedPlan
```

---

## 📱 Intégration sur la page

**Avant:** Formulaire simple avec sélection de plan d'abord
```vue
<SubscriptionForm
  :form-data="subscriptionForm"
  :selected-plan="getSelectedPlan"
  :is-processing="isProcessing"
  :error="errorMessage"
  @submit="handleSubmit"
/>
```

**Après:** Flux intelligent email-first
```vue
<SubscriptionFormEmail />
```

### Avantages
✅ **Email vérifié en priorité** - Évite les doublons  
✅ **Pré-remplissage automatique** - Meilleure UX  
✅ **Moins de saisie** - Utilisateurs existants pré-remplis  
✅ **Modification possible** - Correction avant validation  
✅ **Responsive** - Fonctionne sur mobile/desktop

---

## 🚀 Utilisation

### 1. Importer le composant
```vue
<script setup>
import { SubscriptionFormEmail } from '#components'
</script>
```

### 2. L'ajouter au template
```vue
<template>
  <SubscriptionFormEmail />
</template>
```

### 3. C'est tout !
Le composant gère l'intégralité du flux :
- Vérification email
- Enregistrement
- Sélection de plan
- Création d'abonnement
- Confirmation

---

## ✨ Flux utilisateur complet

```
👤 Nouvel utilisateur
├─ Entre email → N'existe pas
├─ Remplit registration form (pwd, nom, tel)
├─ registerUser() appelée
├─ Redirect → Sélection plan
├─ Choisit plan
├─ createSubscription() appelée
└─ ✅ Confirmation

👤 Utilisateur existant
├─ Entre email → Existe
├─ Données pré-remplies automatiquement
├─ Bouton "Continuer" ou "Modifier"
├─ Si continuer → Sélection plan
├─ Choisit plan
├─ createSubscription() appelée
└─ ✅ Confirmation
```

---

## 📊 État de compilation

✅ **TypeScript**: 0 erreurs  
✅ **Responsive design**: Testé  
✅ **Styling intégré**: Adapté au design system  
✅ **Composable utilisé**: useSubscription  

---

## 🔗 Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `components/SubscriptionFormEmail.vue` | Créé (nouveau composant) |
| `pages/subscriber/index.vue` | Import de SubscriptionFormEmail |

---

## 💡 Prochaines étapes

1. **Tester le flux** :
   - Entrer email existant
   - Entrer email nouveau
   - Créer compte
   - Sélectionner plan
   - Vérifier confirmation

2. **Adapter si nécessaire** :
   - Personnaliser les messages
   - Modifier le styling si besoin
   - Ajouter plus d'étapes ou validations

3. **Déployer** :
   - Push les changements
   - Tester en production
   - Monitorer les inscriptions
