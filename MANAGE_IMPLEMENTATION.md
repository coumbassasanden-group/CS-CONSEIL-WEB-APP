# Implémentation complète pour /subscriber/manage.vue

## Utilisation du composable useAuth

### Import du composable:
```typescript
import { useAuth } from '~/composables/useAuth'
```

### Exemple d'utilisation complète:

```typescript
<template>
  <div class="manage-page">
    <!-- Afficher le profil utilisateur -->
    <div class="user-profile">
      <h2>Bienvenue, {{ userFullName }}!</h2>
      <p>Email: {{ userEmail }}</p>
      <p>Rôle: {{ userRole }}</p>
    </div>

    <!-- Afficher le token -->
    <div class="token-info" v-if="authToken">
      <p>Token: {{ authToken.substring(0, 20) }}...</p>
    </div>

    <!-- Bouton de déconnexion -->
    <button @click="handleLogout">Se déconnecter</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const {
  getAuthUser,
  getAuthToken,
  getUserFullName,
  getUserEmail,
  getUserRole,
  getUserId,
  isLoggedIn,
  logout,
  getAuthHeader
} = useAuth()

// États
const userFullName = ref('')
const userEmail = ref('')
const userRole = ref('')
const authToken = ref('')
const authUser = ref<any>(null)

// Vérifier l'authentification au montage
onMounted(() => {
  // Vérifier si l'utilisateur est connecté
  if (!isLoggedIn()) {
    console.log('Utilisateur non connecté, redirection...')
    navigateTo('/subscriber/success')
    return
  }

  // Récupérer les données
  authUser.value = getAuthUser()
  userFullName.value = getUserFullName() || ''
  userEmail.value = getUserEmail() || ''
  userRole.value = getUserRole() || ''
  authToken.value = getAuthToken() || ''
})

// Gestion de la déconnexion
const handleLogout = () => {
  logout()
  navigateTo('/subscriber')
}

// Exemple: Appeler une API avec authentification
const fetchUserData = async () => {
  try {
    const headers = getAuthHeader()
    const response = await $fetch('/api/user/profile', {
      headers
    })
    console.log('Données utilisateur:', response)
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
  }
}
</script>
```

## Données disponibles

### Depuis localStorage:

```typescript
// localStorage.authUser
{
  id: "ead262a7-8151-4f59-ba16-346c18f10d2f",
  email: "admin@altnews.com",
  firstName: "Admin",
  lastName: "User",
  phone: null,
  role: "ADMIN",
  isActive: true,
  createdAt: "2025-12-13T20:27:56.268Z",
  updatedAt: "2025-12-13T20:27:56.268Z"
}

// localStorage.authToken
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// localStorage.authData
{
  user: { /* same as authUser */ },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  loginTime: "2025-12-14T10:30:45.123Z"
}
```

## Cas d'usage courants

### 1. Afficher le nom de l'utilisateur dans l'entête
```typescript
const { getUserFullName } = useAuth()

const userName = computed(() => {
  return getUserFullName() || 'Utilisateur'
})
```

### 2. Afficher l'email de l'utilisateur
```typescript
const { getUserEmail } = useAuth()

onMounted(() => {
  const email = getUserEmail()
  console.log(email) // "admin@altnews.com"
})
```

### 3. Effectuer une requête API authentifiée
```typescript
const { getAuthHeader } = useAuth()

const deleteAccount = async () => {
  try {
    const response = await $fetch('/api/user/delete', {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    // Déconnexion et redirection
    logout()
    navigateTo('/')
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### 4. Protéger une page - Vérifier l'authentification
```typescript
const { isLoggedIn } = useAuth()

onMounted(() => {
  if (!isLoggedIn()) {
    // Rediriger vers la connexion si pas authentifié
    navigateTo('/subscriber/success')
  }
})
```

### 5. Afficher du contenu selon le rôle
```typescript
const { hasRole } = useAuth()

const isAdmin = computed(() => {
  return hasRole('ADMIN')
})
```

## Flux complet de connexion et réutilisation

```
1. success.vue: Utilisateur se connecte
   ↓
2. POST /api/auth/login
   ↓
3. Réponse: { user, token }
   ↓
4. useAuth().setAuthData(user, token)
   ↓
5. localStorage contient: authUser, authToken, authData
   ↓
6. Redirection vers /subscriber/manage
   ↓
7. manage.vue: useAuth() lit les données
   ↓
8. Affichage du profil utilisateur
```

## Points importants à retenir

✅ **À faire:**
- Utiliser le composable `useAuth` pour toutes les opérations d'authentification
- Vérifier `isLoggedIn()` au montage des pages protégées
- Utiliser `getAuthHeader()` pour les requêtes API authentifiées
- Appeler `logout()` avant de rediriger

❌ **À éviter:**
- Accéder directement à localStorage sans vérification `process.server`
- Stocker des données sensibles en localStorage
- Oublier de nettoyer les données lors de la déconnexion
- Utiliser le token directement sans le préfixe "Bearer "

## Intégration avec pages existantes

### manage.vue - Ajouter la vérification d'authentification
```typescript
import { useAuth } from '~/composables/useAuth'

onMounted(() => {
  const { isLoggedIn } = useAuth()
  
  if (!isLoggedIn()) {
    navigateTo('/subscriber/success')
  }
})
```

### Afficher les informations de l'utilisateur
```typescript
const { getUserFullName, getUserEmail } = useAuth()

const displayName = ref('')
const displayEmail = ref('')

onMounted(() => {
  displayName.value = getUserFullName() || 'Utilisateur'
  displayEmail.value = getUserEmail() || 'email@example.com'
})
```
