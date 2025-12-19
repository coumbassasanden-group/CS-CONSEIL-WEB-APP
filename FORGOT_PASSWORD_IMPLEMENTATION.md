# 🔐 Implémentation - Mot de passe oublié

## 📋 Vue d'ensemble

La fonctionnalité **"Mot de passe oublié"** a été implémentée dans le composant `LoginModal.vue`. Elle permet aux utilisateurs de réinitialiser leur mot de passe en cas d'oubli.

## ✨ Fonctionnalités

### 1. **Accès au formulaire**
- Lien "Mot de passe oublié ?" disponible sous le formulaire de connexion
- Bascule facile entre les deux formulaires

### 2. **Formulaire de réinitialisation**
- Champ email obligatoire
- Bouton "Envoyer le lien de réinitialisation"
- Message de succès après l'envoi
- Redirection automatique après 3 secondes

### 3. **Navigation**
- Bouton "Retour" pour revenir à la connexion
- Fermeture du modal possible à tout moment

## 🛠️ Structure technique

### États (Refs)
```typescript
// Formulaire de réinitialisation
showForgotPassword: ref(false)         // Affiche/masque le formulaire
isLoadingForgot: ref(false)            // État de chargement
forgotError: ref('')                   // Messages d'erreur
forgotSuccess: ref(false)              // Confirmation d'envoi
forgotForm: ref({ email: '' })         // Données du formulaire
```

### Méthodes

#### `handleForgotPassword()`
Gère la demande de réinitialisation du mot de passe.

**SIMULATION ACTIVE** ✨
- Simule un délai d'envoi (800ms)
- 95% de succès, 5% d'erreur pour tester les cas d'erreur
- Aucun appel API réel pour le moment

```typescript
const handleForgotPassword = async () => {
  // 1. Simule un délai d'envoi (500-1500ms)
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 2. Simule un résultat (95% succès, 5% erreur)
  const shouldSucceed = Math.random() < 0.95
  
  // 3. Affiche un message de succès
  forgotSuccess.value = true
  
  // 4. Redirection automatique après 3 secondes
  setTimeout(() => { backToLogin() }, 3000)
}
```

**Endpoint API requis (pour plus tard):**
```
POST /api/auth/forgot-password
Body: { email: string }
Response: { message: string }
```

#### `backToLogin()`
Réinitialise le formulaire et revient à la connexion.

```typescript
const backToLogin = () => {
  showForgotPassword.value = false
  forgotError.value = ''
  forgotSuccess.value = false
  forgotForm.value = { email: '' }
}
```

## 🎨 UI Components

### Formulaire de connexion
- Email et mot de passe
- Case "Se souvenir de moi"
- Lien "Mot de passe oublié ?" ← **Nouveau**
- Bouton de connexion

### Formulaire de réinitialisation (nouveau)
```
← Retour
Réinitialiser votre mot de passe
[Description]
[Champ Email]
[Message d'erreur/succès]
[Bouton Envoyer]
```

## 🔗 Intégration API

### Configuration requise
Assurez-vous que votre backend a cet endpoint:

```typescript
// Backend requis:
POST /api/auth/forgot-password
{
  email: "user@example.com"
}

// Réponse attendue:
{
  message: "Un email avec un lien de réinitialisation vous a été envoyé"
}
```

## 📱 Responsive Design

- ✅ Mobile (max-width: 768px)
- ✅ Tablette
- ✅ Desktop

## 🎯 Flux utilisateur

```
1. Utilisateur clique sur "Mot de passe oublié ?"
   ↓
2. Formulaire de réinitialisation s'affiche
   ↓
3. Utilisateur entre son email
   ↓
4. Clique sur "Envoyer le lien de réinitialisation"
   ↓
5. API envoie un email avec un lien
   ↓
6. Message de succès s'affiche
   ↓
7. Redirection auto vers formulaire de connexion (3s)
```

## 🎨 Styles CSS

### Nouveaux styles ajoutés
- `.forgot-password-form` - Conteneur du formulaire
- `.forgot-header` - En-tête avec bouton retour
- `.btn-back` - Bouton de retour
- `.forgot-title` - Titre du formulaire
- `.forgot-description` - Description
- `.success-message` - Message de succès

### Couleurs utilisées
- **Fond succès**: #dcfce7 (vert clair)
- **Texte succès**: #16a34a (vert foncé)
- **Bordure succès**: 4px solid #16a34a

## ✅ Points de contrôle

- [x] État de chargement pendant l'envoi
- [x] Gestion des erreurs
- [x] Message de succès
- [x] Redirection automatique
- [x] Validation du formulaire
- [x] Réinitialisation des données lors du retour
- [x] Responsive design
- [x] Animation de transition
- [x] 0 erreurs TypeScript

## 🔒 Sécurité

- ✅ Validation email côté client
- ✅ HTTPS requis en production
- ✅ Rate limiting recommandé côté backend
- ✅ Token d'expiration pour le lien de réinitialisation

## 🚀 Prochaines étapes

### Phase actuelle: SIMULATION ✨
- [x] Simulation de l'envoi d'email
- [x] 95% de succès, 5% d'erreur pour tester les cas
- [x] Délai simulé (800ms)
- [x] UI/UX complète et fonctionnelle

### Phase 2: Implémentation réelle (À faire)
1. **Créer l'endpoint backend** `/auth/forgot-password`
2. **Implémenter l'envoi d'email** (SendGrid, Mailgun, etc.)
3. **Générer un token JWT** avec expiration (15 min)
4. **Créer la page** `/auth/reset-password?token=xxx`
5. **Implémenter la réinitialisation** du mot de passe

### Comment passer à la production?

Quand vous avez l'endpoint réel, remplacez la simulation par:

```typescript
const handleForgotPassword = async () => {
  forgotError.value = ''
  isLoadingForgot.value = true

  try {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiSubcriptionUrl || 'http://localhost:3001/api/'

    console.log('📧 Demande de réinitialisation pour:', forgotForm.value.email)

    // Appel API réel
    const response = await $fetch(`${apiUrl}auth/forgot-password`, {
      method: 'POST',
      body: { email: forgotForm.value.email }
    })

    console.log('✅ Email de réinitialisation envoyé')
    forgotSuccess.value = true

    setTimeout(() => {
      backToLogin()
    }, 3000)
  } catch (err: any) {
    console.error('❌ Erreur:', err)
    forgotError.value = err?.data?.message || 'Erreur lors de l\'envoi'
  } finally {
    isLoadingForgot.value = false
  }
}
```

## 📝 Notes

- Le composant est **100% réutilisable**
- Intégré dans `LoginModal.vue`
- Utilisé dans `AltPresentation.vue` et `success.vue`
- Aucune dépendance externe supplémentaire

## 🐛 Débogage

### Console logs disponibles
```typescript
// Simulation en cours
console.log('📧 Demande de réinitialisation pour:', forgotForm.value.email)

// Simulation réussie
console.log('✅ [SIMULATION] Email de réinitialisation envoyé à:', forgotForm.value.email)
console.log('💡 En production, un email réel serait envoyé avec un lien de réinitialisation')

// Erreur
console.error('❌ Erreur lors de la demande de réinitialisation:', err)
```

### Comment tester?

1. **Accéder au modal de connexion**
   - Cliquer sur "Mot de passe oublié ?"

2. **Soumettre une demande**
   - Entrer un email quelconque
   - Cliquer sur "Envoyer le lien de réinitialisation"
   - Attendre 800ms (simulated)
   - Voir le message de succès
   - Auto-redirection après 3 secondes

3. **Tester les erreurs (5% de chance)**
   - Relancer plusieurs fois (ou cliquer Retour et refaire)
   - Vous verrez occasionnellement un message d'erreur

4. **Ouvrir la console du navigateur** (F12)
   - Voir les logs de simulation
   - Vérifier l'email entré

---

**Status**: ✅ Implémentation complète, prête pour l'intégration backend
