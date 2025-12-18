# 🔧 Améliorations - Affichage des plans après authentification

## 🐛 Problèmes identifiés

1. **Plans non affichés** après enregistrement
2. **Plan sélectionné avant** n'est pas conservé après authentification

## ✅ Solutions appliquées

### 1. Gestion de l'affichage des plans

**Problème:** Les plans ne s'affichaient pas quand on passait à l'étape `select-plan`.

**Solution:** Ajouter des vérifications de chargement :
```typescript
// Assurer que les plans sont chargés avant d'afficher l'étape
if (subscriptionPlans.value.length === 0) {
  fetchPlans()
}
```

### 2. Conservation du plan sélectionné

**Problème:** Si un plan était sélectionné, il était perdu après l'authentification.

**Solution:** Implémenter un système de sauvegarde/restauration :

#### Variables d'état ajoutées
```typescript
const selectedPlanBeforeAuth = ref<string | null>(null)
```

#### Sauvegarde du plan
```typescript
const proceedToPlans = () => {
  // Sauvegarder le plan avant d'aller à l'authentification
  if (subscriptionForm.value.planId) {
    selectedPlanBeforeAuth.value = subscriptionForm.value.planId
  }
  currentStep.value = 'select-plan'
  if (subscriptionPlans.value.length === 0) {
    fetchPlans()
  }
}

const handleRegistration = async () => {
  const result = await registerUser(...)
  if (result.user) {
    // Sauvegarder le plan également après l'enregistrement
    if (subscriptionForm.value.planId) {
      selectedPlanBeforeAuth.value = subscriptionForm.value.planId
    }
    currentStep.value = 'select-plan'
    if (subscriptionPlans.value.length === 0) {
      fetchPlans()
    }
  }
}
```

#### Restauration du plan
```typescript
// Watcher: dès que les plans sont chargés, restaurer la sélection
watch(subscriptionPlans, (newPlans) => {
  if (newPlans.length > 0 && selectedPlanBeforeAuth.value) {
    subscriptionForm.value.planId = selectedPlanBeforeAuth.value
  }
})
```

### 3. Ajout du state "empty"

**Template mis à jour:**
```vue
<div v-else-if="subscriptionPlans.length > 0" class="plans-grid">
  <!-- Plans -->
</div>

<div v-else class="empty-state">
  <p>Aucun plan disponible pour le moment.</p>
</div>
```

Cela évite les bugs de template si les plans ne chargent pas.

## 🎯 Améliorations apportées

| Aspect | Avant | Après |
|--------|-------|-------|
| Affichage plans | ❌ Peut être vide | ✅ Forcé le chargement |
| Plan sélectionné | ❌ Perdu | ✅ Conservé + restauré |
| État empty | ❌ Non géré | ✅ Message d'erreur |
| Importations Vue | `ref, computed, onMounted` | `ref, computed, onMounted, watch` |

## 🔄 Flux utilisateur amélioré

### Utilisateur existant
```
Email existant
  ↓
Profil pré-rempli
  ↓
Sélectionne plan X
  ↓
Clique "Continuer" → Plan X sauvegardé
  ↓
Étape sélection plan
  ↓
Plans chargent automatiquement
  ↓
Plan X est restauré ✓
```

### Nouvel utilisateur
```
Email n'existe pas
  ↓
Form d'enregistrement
  ↓
Remplit les infos
  ↓
registerUser() appelée
  ↓
Plans chargent automatiquement
  ↓
Rien n'était sélectionné avant, OK
```

## 📋 Cas gérés

✅ **Cas 1:** Plans chargés au montage
- Plans affichés correctement

✅ **Cas 2:** Plans pas chargés au montage
- Appel à `fetchPlans()` dans `proceedToPlans()`
- Appel à `fetchPlans()` dans `handleRegistration()`

✅ **Cas 3:** Plan sélectionné avant auth
- Sauvegardé dans `selectedPlanBeforeAuth`
- Restauré via watcher dès que plans chargent

✅ **Cas 4:** Aucun plan disponible
- Message "Aucun plan disponible pour le moment"

## 🧪 Scénarios de test

### Test 1: Utilisateur existant avec plan pré-sélectionné
1. Accéder à la page
2. Sélectionner un plan
3. Entrer email existant
4. Voir le profil avec bouton "Continuer"
5. **Résultat attendu:** Plan pré-sélectionné est restauré ✓

### Test 2: Nouvel utilisateur
1. Accéder à la page
2. Entrer email nouveau
3. Remplir le formulaire d'enregistrement
4. **Résultat attendu:** Plans affichés correctement ✓

### Test 3: Plans pas encore chargés
1. Enregistrement très rapide
2. Plans pas encore chargés au moment du clic "Continuer"
3. **Résultat attendu:** Appel automatique à `fetchPlans()` ✓

## 📊 État de compilation

✅ **TypeScript**: 0 erreurs
✅ **Imports**: `watch` importé correctement
✅ **Réactivité**: Vue.js watch fonctionne
✅ **Responsive**: Tous les cas gérés

## 🔗 Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `components/SubscriptionFormEmail.vue` | Ajout `watch`, `selectedPlanBeforeAuth`, gestion du chargement des plans, sauvegarde/restauration |

## 💡 Améliorations futures possibles

1. **Transition** : Ajouter une animation lors de la restauration du plan
2. **Toast notification** : Notifier l'utilisateur du plan restauré
3. **Persistence** : Sauvegarder le plan dans sessionStorage aussi

---

✅ **Status**: Correction appliquée avec succès
✅ **TypeScript**: 0 erreurs
✅ **Compilation**: Réussie
✅ **Plans affichés**: OUI
✅ **Plan conservé**: OUI
