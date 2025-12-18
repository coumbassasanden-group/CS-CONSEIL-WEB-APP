# 🧪 Tests du Middleware d'Authentification

## Scénarios de test

### ✅ Scénario 1: Accès autorisé à /subscriber/manage

**Préconditions:**
```javascript
// Console du navigateur
localStorage.setItem('authToken', 'valid-jwt-token-12345')
localStorage.setItem('authUser', JSON.stringify({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  isActive: true
}))
localStorage.setItem('selectedPlan', JSON.stringify({
  id: 'plan-pro',
  name: 'Pro',
  price: 29.99
}))
```

**Action:**
- Naviguer vers `http://localhost:3000/fr/subscriber/manage`

**Résultat attendu:**
- ✅ Page chargée sans redirection
- ✅ Console affiche: "✅ Authentification valide pour test@example.com"
- ✅ Affichage des infos utilisateur
- ✅ Affichage du plan d'abonnement

---

### ❌ Scénario 2: Pas de token (redirection)

**Préconditions:**
```javascript
// localStorage vide ou sans authToken
localStorage.clear()
```

**Action:**
- Naviguer vers `http://localhost:3000/fr/subscriber/manage`

**Résultat attendu:**
- ❌ Page redirigée vers `/fr/subscriber`
- ✅ Console affiche: "❌ Authentification requise pour accéder à /subscriber/manage"

---

### ⚠️ Scénario 3: Token valide mais utilisateur inactif

**Préconditions:**
```javascript
localStorage.setItem('authToken', 'valid-jwt-token-12345')
localStorage.setItem('authUser', JSON.stringify({
  id: 'user-456',
  email: 'inactive@example.com',
  firstName: 'Marie',
  lastName: 'Martin',
  isActive: false  // ← Utilisateur inactif
}))
```

**Action:**
- Naviguer vers `http://localhost:3000/fr/subscriber/manage`

**Résultat attendu:**
- ⚠️ Page redirigée vers `/fr/subscriber`
- ✅ localStorage vidé (authToken, authUser, authData supprimés)
- ✅ Console affiche: "⚠️ Compte utilisateur inactif"

---

### 🔀 Scénario 4: Redirection de /subscriber/success vers /subscriber/manage

**Préconditions:**
```javascript
// Utilisateur authentifié avec plan sélectionné
localStorage.setItem('authToken', 'valid-jwt-token-12345')
localStorage.setItem('authUser', JSON.stringify({
  id: 'user-789',
  email: 'authenticated@example.com',
  firstName: 'Pierre',
  lastName: 'Dupuis',
  isActive: true
}))
localStorage.setItem('selectedPlan', JSON.stringify({
  id: 'plan-premium',
  name: 'Premium',
  price: 49.99
}))
```

**Action:**
- Naviguer vers `http://localhost:3000/fr/subscriber/success`

**Résultat attendu:**
- 🔀 Page redirigée vers `/fr/subscriber/manage`
- ✅ Console affiche: "➡️ Redirection automatique: /subscriber/success → /subscriber/manage"
- ✅ Page manage affiche les infos utilisateur

---

### 📱 Scénario 5: JSON invalide dans authUser

**Préconditions:**
```javascript
localStorage.setItem('authToken', 'valid-jwt-token-12345')
localStorage.setItem('authUser', '{invalid json}')  // ← JSON invalide
```

**Action:**
- Naviguer vers `http://localhost:3000/fr/subscriber/manage`

**Résultat attendu:**
- ❌ Page redirigée vers `/fr/subscriber`
- ✅ localStorage vidé
- ✅ Console affiche: "❌ Erreur lors de la vérification de l'authentification: SyntaxError..."

---

## 🔍 Commandes de test rapide

### Test dans la console du navigateur:

```javascript
// Test 1: Vérifier les infos actuelles
console.log({
  authToken: localStorage.getItem('authToken') ? '✅' : '❌',
  authUser: localStorage.getItem('authUser') ? '✅' : '❌',
  selectedPlan: localStorage.getItem('selectedPlan') ? '✅' : '❌'
})

// Test 2: Créer un utilisateur valide
const testUser = {
  id: 'test-user-' + Date.now(),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+33612345678',
  role: 'subscriber',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
localStorage.setItem('authUser', JSON.stringify(testUser))
localStorage.setItem('authToken', 'test-token-' + Date.now())

// Test 3: Vérifier les localStorage après test
console.log('Infos sauvegardées:', {
  user: JSON.parse(localStorage.getItem('authUser')),
  hasToken: !!localStorage.getItem('authToken')
})

// Test 4: Nettoyer après test
localStorage.removeItem('authToken')
localStorage.removeItem('authUser')
localStorage.removeItem('authData')
console.log('✅ localStorage nettoyé')
```

---

## 📊 Matrice de test

| Scénario | authToken | authUser | isActive | Plan | Résultat attendu |
|----------|-----------|----------|----------|------|------------------|
| Accès OK | ✅ | ✅ Valid | true | - | ✅ Chargement |
| No Token | ❌ | ✅ Valid | true | - | ❌ Redirection |
| No User | ✅ | ❌ | true | - | ❌ Redirection |
| Invalid JSON | ✅ | ❌ Invalid | - | - | ❌ Redirection |
| Inactif | ✅ | ✅ Valid | false | - | ❌ Redirection |
| Authenticated | ✅ | ✅ Valid | true | ✅ | 🔀 Redirection |

---

## 🎯 Critères de réussite

Le middleware fonctionne correctement si:

- [ ] Accès autorisé quand `authToken` + `authUser` valides + `isActive: true`
- [ ] Redirection vers `/subscriber` quand pas de `authToken`
- [ ] Redirection vers `/subscriber` quand `authUser` invalide
- [ ] Redirection vers `/subscriber` quand `isActive: false`
- [ ] Nettoyage du localStorage lors d'une redirection
- [ ] Logs console clairs et informatifs
- [ ] Pas d'erreur d'hydratation SSR
- [ ] Redirection `/subscriber/success` → `/subscriber/manage` si authentifié + plan

---

## 🚀 Procédure de test complète

### 1. Tester l'accès refusé
```
1. Ouvrir DevTools → Application → Local Storage
2. Vérifier que tout est vide
3. Aller sur /fr/subscriber/manage
4. ❌ Devrait rediriger vers /fr/subscriber
5. Vérifier console: "❌ Authentification requise..."
```

### 2. Tester l'accès autorisé
```
1. Aller sur /fr/subscriber
2. Sélectionner un plan
3. Procéder à la "connexion" (success page)
4. Introduire les données d'authentification
5. ✅ Devrait rediriger vers /fr/subscriber/manage
6. Page manage doit afficher les infos utilisateur
```

### 3. Tester la déconnexion
```
1. Dans DevTools, supprimer localStorage.authToken
2. Rafraîchir /fr/subscriber/manage
3. ❌ Devrait rediriger vers /fr/subscriber
```

---

## 📝 Rapport de test

À remplir après chaque test:

```
Date: [DATE]
Environnement: [LOCAL/STAGING/PROD]
Navigateur: [CHROME/FIREFOX/SAFARI]

Scénario 1 - Accès OK: [ ] PASS [ ] FAIL
Scénario 2 - No Token: [ ] PASS [ ] FAIL
Scénario 3 - User Inactif: [ ] PASS [ ] FAIL
Scénario 4 - Redirection: [ ] PASS [ ] FAIL
Scénario 5 - JSON Invalid: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
```
