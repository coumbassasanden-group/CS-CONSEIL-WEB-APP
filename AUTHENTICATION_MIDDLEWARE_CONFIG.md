# 🔐 Configuration du Middleware d'Authentification

## ✅ Étapes complétées

### 1. Création du middleware
**Fichier**: `/middleware/auth.ts`

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  // Vérifie l'authentification avant d'accéder aux routes protégées
  // - /subscriber/manage (routes with 'manage' dans le path)
  // - Redirection automatique depuis /subscriber/success
})
```

**Fonctionnalités:**
- ✅ Vérification du token JWT
- ✅ Validation de l'objet utilisateur
- ✅ Vérification du statut utilisateur (isActive)
- ✅ Nettoyage du localStorage en cas d'erreur
- ✅ Logs de débogage détaillés
- ✅ Gestion SSR-safe (pas d'accès localStorage côté serveur)

---

### 2. Application du middleware à manage.vue
**Fichier**: `/pages/subscriber/manage.vue`

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

**Effet:**
- Route `/[locale]/subscriber/manage` est maintenant protégée
- Exécution du middleware avant le rendu de la page
- Redirection automatique si non authentifié

---

## 🔄 Flux de protection

```
Utilisateur → navigate(/fr/subscriber/manage)
                    ↓
            Middleware 'auth' s'exécute
                    ↓
            ┌─────────────────────┐
            │ Vérifie localStorage │
            └─────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    Pas de token        Token valide
         ↓                     ↓
    Redirection          Vérifie user
    vers /subscriber         ↓
                    ┌────────┴────────┐
                    ↓                 ↓
                Invalide          Valide
                    ↓                 ↓
                Nettoyage      Vérifie isActive
                Redirection         ↓
                            ┌───────┴───────┐
                            ↓               ↓
                        false            true
                            ↓               ↓
                        Nettoyage   ✅ Accès
                        Redirection  autorisé
```

---

## 📋 Checklist d'implémentation

- [x] Création du fichier middleware `/middleware/auth.ts`
- [x] Vérification du token dans localStorage
- [x] Validation de l'objet utilisateur (JSON parse)
- [x] Vérification du statut isActive
- [x] Nettoyage du localStorage en cas d'erreur
- [x] Logs console pour débogage
- [x] Protection SSR (typeof window)
- [x] Application à manage.vue via definePageMeta
- [x] Documentation complète
- [x] Scénarios de test

---

## 🎯 Routes protégées

### Actuellement protégées:
```
GET /[locale]/subscriber/manage → Middleware 'auth'
```

### À protéger à l'avenir:
```
GET /[locale]/subscriber/edit-profile
GET /[locale]/subscriber/billing
GET /[locale]/subscriber/settings
GET /[locale]/subscriber/account
```

---

## 💾 Données utilisées

### localStorage.authToken
```
Type: String (JWT)
Contenu: Token d'authentification JWT
Créé par: /pages/subscriber/success.vue (handleLogin)
Utilisé par: Middleware + useAuth.ts
```

### localStorage.authUser
```
Type: String (JSON)
Contenu: 
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
Créé par: /pages/subscriber/success.vue (handleLogin)
Utilisé par: Middleware + manage.vue (getAuthUser)
```

### localStorage.selectedPlan
```
Type: String (JSON)
Contenu: Plan d'abonnement sélectionné
Créé par: /pages/subscriber/index.vue
Utilisé par: manage.vue + middleware (redirection success→manage)
```

---

## 🔐 Sécurité

### Points couverts:
- ✅ Vérification du token avant chaque accès
- ✅ Validation de l'objet utilisateur
- ✅ Vérification du statut utilisateur
- ✅ Nettoyage automatique en cas d'erreur
- ✅ Pas d'affichage du contenu sensible sans auth
- ✅ SSR-safe (pas d'accès localStorage côté serveur)

### À ajouter (futur):
- [ ] Validation JWT (expiration, signature)
- [ ] Appel API pour vérifier la validité du token
- [ ] Refresh token automatique
- [ ] Rate limiting des tentatives
- [ ] Logging côté serveur

---

## 📝 Fichiers modifiés

```
✅ /middleware/auth.ts                          (CRÉÉ)
✅ /pages/subscriber/manage.vue                 (MODIFIÉ - ajout definePageMeta)
✅ AUTHENTICATION_MIDDLEWARE.md                 (CRÉÉ - Documentation)
✅ AUTHENTICATION_MIDDLEWARE_TESTS.md           (CRÉÉ - Guide de test)
```

---

## 🚀 Utilisation

### Appliquer le middleware à une nouvelle route:

```vue
<script setup lang="ts">
// Dans n'importe quelle page
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Accéder aux données utilisateur:

```vue
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { getAuthUser, isLoggedIn } = useAuth()

onMounted(() => {
  if (isLoggedIn()) {
    const user = getAuthUser()
    console.log('Connecté en tant que:', user.email)
  }
})
</script>

<template>
  <div>
    <p>{{ getAuthUser()?.firstName }} {{ getAuthUser()?.lastName }}</p>
  </div>
</template>
```

---

## 🧪 Tests

Voir le fichier `AUTHENTICATION_MIDDLEWARE_TESTS.md` pour:
- 5 scénarios de test détaillés
- Procédures de test step-by-step
- Commandes console pour tester rapidement
- Matrice de test
- Rapport de test à remplir

---

## 📞 Support

### Le middleware ne fonctionne pas ?

**Vérifier:**
1. Le fichier `/middleware/auth.ts` existe
2. Le middleware est appliqué via `definePageMeta({ middleware: 'auth' })`
3. Les données sont présentes dans localStorage
4. Pas d'erreur dans la console du navigateur

**Débogage:**
```javascript
// Console du navigateur
console.log({
  authToken: localStorage.getItem('authToken'),
  authUser: localStorage.getItem('authUser'),
  selectedPlan: localStorage.getItem('selectedPlan')
})
```

---

## ✨ Prochaines étapes

1. ✅ Créer le middleware auth.ts
2. ✅ Appliquer à /subscriber/manage
3. ✅ Créer la documentation
4. ⏭️ Tester les 5 scénarios
5. ⏭️ Appliquer à d'autres routes
6. ⏭️ Ajouter validation JWT côté serveur
