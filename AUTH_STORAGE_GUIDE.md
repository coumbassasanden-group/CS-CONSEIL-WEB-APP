# Guide de stockage des données d'authentification

## Données sauvegardées dans localStorage après connexion réussie

Après un appel réussi à `/api/auth/login`, les données suivantes sont sauvegardées dans `localStorage`:

### 1. **authUser** (Données utilisateur)
```json
{
  "id": "ead262a7-8151-4f59-ba16-346c18f10d2f",
  "email": "admin@altnews.com",
  "firstName": "Admin",
  "lastName": "User",
  "phone": null,
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2025-12-13T20:27:56.268Z",
  "updatedAt": "2025-12-13T20:27:56.268Z"
}
```

**Récupération:**
```typescript
const authUser = JSON.parse(localStorage.getItem('authUser') || '{}')
console.log(authUser.email) // "admin@altnews.com"
console.log(authUser.firstName) // "Admin"
```

### 2. **authToken** (JWT Token)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVhZDI2MmE3LTgxNTEtNGY1OS1iYTE2LTM0NmMxOGYxMGQyZiIsImVtYWlsIjoiYWRtaW5AYWx0bmV3cy5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjU2NjUwNzgsImV4cCI6MTc2NjI2OTg3OH0.PXoXmpbN-nQ0F0R7b4DkUTF1wH26JsjSGXjQ5h540ig
```

**Récupération:**
```typescript
const authToken = localStorage.getItem('authToken')
console.log(authToken) // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. **authData** (Données complètes de connexion)
```json
{
  "user": { /* même structure que authUser */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "loginTime": "2025-12-14T10:30:45.123Z"
}
```

**Récupération:**
```typescript
const authData = JSON.parse(localStorage.getItem('authData') || '{}')
console.log(authData.user.email)
console.log(authData.token)
console.log(authData.loginTime)
```

## Utilisation sur /subscriber/manage.vue

### Example 1: Afficher le nom de l'utilisateur connecté
```typescript
import { ref, onMounted } from 'vue'

const userFullName = ref('')

onMounted(() => {
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}')
  userFullName.value = `${authUser.firstName} ${authUser.lastName}`
})
```

### Example 2: Utiliser le token pour des requêtes API
```typescript
const fetchUserData = async () => {
  const authToken = localStorage.getItem('authToken')
  const response = await $fetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
}
```

### Example 3: Vérifier la connexion de l'utilisateur
```typescript
const isUserLoggedIn = computed(() => {
  return !!localStorage.getItem('authToken')
})

onMounted(() => {
  if (!isUserLoggedIn.value) {
    navigateTo('/subscriber/success') // Rediriger si pas connecté
  }
})
```

### Example 4: Créer un composable réutilisable

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const getAuthUser = () => {
    const authUser = localStorage.getItem('authUser')
    return authUser ? JSON.parse(authUser) : null
  }

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const isLoggedIn = () => {
    return !!localStorage.getItem('authToken')
  }

  const logout = () => {
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authData')
  }

  return {
    getAuthUser,
    getAuthToken,
    isLoggedIn,
    logout
  }
}
```

### Utilisation du composable:
```typescript
import { useAuth } from '~/composables/useAuth'

const { getAuthUser, getAuthToken, isLoggedIn, logout } = useAuth()

const user = getAuthUser()
const token = getAuthToken()

if (isLoggedIn()) {
  console.log('Utilisateur connecté:', user.email)
}
```

## Flux complet de connexion

1. **Utilisateur clique sur "Gérer mon abonnement"** → Modal de connexion s'ouvre
2. **Formulaire soumis** → Appel POST `/api/auth/login`
3. **Réponse reçue** → 3 localStorage keys créées (authUser, authToken, authData)
4. **Redirection** → Navigation vers `/subscriber/manage`
5. **Page chargée** → Peut lire les données depuis localStorage

## Points importants

- ⚠️ **Sécurité**: Ne stockez JAMAIS de données sensibles en localStorage côté client
- 🔒 **Token**: Le token doit être envoyé en header `Authorization: Bearer <token>` pour les requêtes authentifiées
- 🔄 **Synchronisation**: localStorage est synchrone, pas d'await nécessaire
- 📱 **SSR**: Utilisez `process.client` ou `onMounted()` pour éviter les erreurs SSR

## Nettoyage

Pour se déconnecter:
```typescript
localStorage.removeItem('authUser')
localStorage.removeItem('authToken')
localStorage.removeItem('authData')
localStorage.removeItem('selectedPlan')      // Optionnel
localStorage.removeItem('userVerification')  // Optionnel
navigateTo('/subscriber')
```
