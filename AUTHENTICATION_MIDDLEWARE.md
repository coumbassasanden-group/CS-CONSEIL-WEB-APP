# 🔐 Middleware d'Authentification - Subscriber Manage

## Vue d'ensemble

Le middleware `auth.ts` protège les routes sensibles de l'application en vérifiant que l'utilisateur est correctement authentifié avant d'accéder à certaines pages.

## 📍 Routes protégées

### 1. `/subscriber/manage`
**Protection**: ✅ Authentification requise
- Vérifie que `authToken` existe en localStorage
- Vérifie que `authUser` est valide et parsable
- Vérifie que l'utilisateur est actif (`isActive === true`)
- Redirige vers `/subscriber` si non authentifié

### 2. `/subscriber/success`
**Protection**: Redirection automatique
- Si utilisateur authentifié + plan sélectionné → redirige vers `/subscriber/manage`
- Sinon → affiche la page de connexion

## 🔑 Données utilisées

Le middleware accède à ces clés localStorage :
```javascript
localStorage.authToken      // JWT token string
localStorage.authUser       // JSON string avec objet utilisateur
localStorage.selectedPlan   // JSON string avec le plan sélectionné
```

## 🛡️ Vérifications effectuées

### Pour `/subscriber/manage`:
```
1. authToken existe ?
   ├─ NON → Redirection vers /subscriber
   └─ OUI ↓
2. authUser existe et est valide JSON ?
   ├─ NON → Supprime les tokens + Redirection
   └─ OUI ↓
3. user.isActive === true ?
   ├─ NON → Supprime les tokens + Redirection
   └─ OUI → Accès autorisé ✅
```

### Pour `/subscriber/success`:
```
authToken + authUser + selectedPlan ?
   ├─ OUI → Redirection vers /subscriber/manage
   └─ NON → Continue vers /subscriber/success
```

## 📝 Logs de debug

Le middleware génère des logs pour faciliter le débogage :

```javascript
✅ Authentification valide pour user@example.com
❌ Authentification requise pour accéder à /subscriber/manage
⚠️  Compte utilisateur inactif
➡️  Redirection automatique: /subscriber/success → /subscriber/manage
```

## 🔄 Flux d'authentification

```
1. Utilisateur accède à /subscriber/manage
                ↓
2. Middleware 'auth' s'exécute (client-side)
                ↓
3. Vérifie localStorage.authToken
                ↓
   ├─ Non trouvé → Redirection /subscriber ❌
   └─ Trouvé ↓
4. Vérifie localStorage.authUser
                ↓
   ├─ Invalide → Supprime + Redirection ❌
   └─ Valide ↓
5. Vérifie user.isActive
                ↓
   ├─ false → Supprime + Redirection ❌
   └─ true → Accès autorisé ✅
```

## 🚀 Application aux routes

### Appliquer le middleware à une page:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Routes actuelles avec le middleware:
- ✅ `/[locale]/subscriber/manage` - Protégée

### Routes pouvant être protégées à l'avenir:
- `/[locale]/subscriber/edit` - Édition du profil
- `/[locale]/subscriber/billing` - Gestion facturation
- `/[locale]/subscriber/settings` - Paramètres

## ⚙️ Configuration

### Seulement côté client
Le middleware inclut une vérification `if (process.server)` pour ne s'exécuter que côté client, où localStorage est disponible.

### Protection SSR
- L'accès à `localStorage` est sécurisé avec `typeof window !== 'undefined'`
- Aucun problème d'hydratation

## 🔗 Intégration avec useAuth

Le middleware fonctionne de manière complémentaire avec `useAuth()` :
- **Middleware**: Protège l'accès aux routes
- **useAuth()**: Fournit les données d'authentification aux composants

## 📊 État après authentification réussie

```javascript
localStorage = {
  authToken: "eyJhbGc...",
  authUser: JSON.stringify({
    id: "user-123",
    email: "user@example.com",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33612345678",
    role: "subscriber",
    isActive: true,
    createdAt: "2025-12-14T10:00:00Z",
    updatedAt: "2025-12-14T10:00:00Z"
  }),
  authData: JSON.stringify({
    user: { ...authUser },
    token: "eyJhbGc...",
    loginTime: "2025-12-14T10:05:00Z"
  }),
  selectedPlan: JSON.stringify({
    id: "plan-pro",
    name: "Pro",
    price: 29.99,
    duration: 30,
    icon: "⭐",
    ...
  })
}
```

## 🐛 Débogage

Ouvrez la console du navigateur pour voir:

```
✅ Authentification valide pour jean@example.com
```

Si vous voyez:
```
❌ Authentification requise pour accéder à /subscriber/manage
```

Cela signifie que `localStorage.authToken` ou `localStorage.authUser` est vide/invalide.

## 🔄 Réévaluation du middleware

Le middleware s'exécute automatiquement:
- À chaque navigation
- Avant le rendu de la page
- Permet la redirection avant l'affichage du contenu

## ✨ Améliorations futures

Possible d'ajouter:
1. Validation du token JWT (expiration, signature)
2. Appel API pour vérifier l'authenticité
3. Refresh token automatique
4. Rate limiting des redirections
5. Logging côté serveur
