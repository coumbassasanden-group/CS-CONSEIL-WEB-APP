# 🧪 Guide de Test - Intégration API Plans

## Récapitulatif de l'intégration

Votre API retourne des plans avec cette structure:

```json
{
  "data": [
    {
      "id": "a4b34a9f-95e2-447b-9d9f-73028853f2fb",
      "name": "Plan Gratuit",
      "description": "Accès limité aux actualités",
      "price": "0",
      "duration": 30,
      "features": "[\"5 articles par mois\",\"Accès aux actualités publiques\"]",
      "isActive": true,
      "createdAt": "2025-12-13T20:28:20.959Z",
      "updatedAt": "2025-12-13T20:28:20.959Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Le code a été mis à jour pour:**
1. ✅ Parser les features du format JSON string en tableau
2. ✅ Convertir les prix du format string en nombre
3. ✅ Gérer les UUIDs (strings) pour les IDs
4. ✅ Extraire les données de la structure `{ data, meta }`

---

## 🔍 Étapes de Test

### Test 1: Accédez à la page des plans

1. **Démarrez votre application Nuxt:**
   ```bash
   npm run dev
   ```

2. **Ouvrez la page des abonnements:**
   - Accédez à: `http://localhost:3000/dev_alt-news/subscriber`
   - Vous devriez voir le chargement des plans

### Test 2: Vérifiez le chargement

**Vous devriez voir:**
- ✓ 3 plans affichés (Plan Gratuit, Plan Mensuel, Plan Annuel)
- ✓ Les prix s'affichent correctement (0€, 9.99€, 99.99€)
- ✓ Les durées s'affichent (30 jours, 365 jours)
- ✓ Les features s'affichent sous forme de liste

**Si vous ne voyez rien:**
- Ouvrez la console (F12) et cherchez les erreurs
- Vérifiez que l'API est accessible: `curl http://localhost:3000/api/plans`

### Test 3: Vérifiez les types en console

Ouvrez la console du navigateur (F12 → Console) et exécutez:

```javascript
// Tester les plans chargés
const plans = subscriptionPlans.value;
console.log('Nombre de plans:', plans.length);

plans.forEach((plan, i) => {
  console.log(`\n=== Plan ${i + 1}: ${plan.name} ===`);
  console.log('Prix:', plan.price, 'Type:', typeof plan.price);
  console.log('Durée:', plan.duration, 'Type:', typeof plan.duration);
  console.log('Features:', plan.features);
  console.log('Features type:', Array.isArray(plan.features) ? 'Array ✓' : 'NOT Array ✗');
  console.log('Features count:', plan.features.length);
  console.log('Actif:', plan.isActive);
});
```

**Résultats attendus:**
```
Plan 1: Plan Gratuit
Prix: 0 Type: number ✓
Durée: 30 Type: number ✓
Features: (2) ["5 articles par mois", "Accès aux actualités publiques"] ✓
Features type: Array ✓
Features count: 2

Plan 2: Plan Mensuel
Prix: 9.99 Type: number ✓
Durée: 30 Type: number ✓
Features: (3) ["Accès illimité aux articles", "Newsletter hebdomadaire", "Sans publicité"] ✓
Features type: Array ✓
Features count: 3

Plan 3: Plan Annuel
Prix: 99.99 Type: number ✓
Durée: 365 Type: number ✓
Features: (5) ["Accès illimité aux articles", "Newsletter quotidienne", "Sans publicité", "Contenu exclusif", "Support prioritaire"] ✓
Features type: Array ✓
Features count: 5
```

### Test 4: Testez la sélection d'un plan

1. **Cliquez sur un plan** dans la page
2. **Vérifiez en console:**
   ```javascript
   console.log('Plan sélectionné:', subscriptionForm.value.planId);
   console.log('Type du planId:', typeof subscriptionForm.value.planId);
   ```
   **Attendu:** `"a4b34a9f-95e2-447b-9d9f-73028853f2fb"` (string UUID)

### Test 5: Vérifiez les calculs de prix

Dans la console:
```javascript
// Tester les comparaisons de prix
const cheapestPlan = Math.min(...subscriptionPlans.value.map(p => p.price));
const mostExpensive = Math.max(...subscriptionPlans.value.map(p => p.price));

console.log('Plan le moins cher:', cheapestPlan + '€');
console.log('Plan le plus cher:', mostExpensive + '€');

// Tester le formatage
const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

subscriptionPlans.value.forEach(plan => {
  console.log(`${plan.name}: ${formatter.format(plan.price)}`);
});
```

**Attendu:**
```
Plan le moins cher: 0€
Plan le plus cher: 99.99€
Plan Gratuit: 0,00 €
Plan Mensuel: 9,99 €
Plan Annuel: 99,99 €
```

### Test 6: Testez les features

```javascript
// Vérifier l'accès aux features
const planMensuel = subscriptionPlans.value.find(p => p.name === 'Plan Mensuel');
console.log('Accès illimité?', planMensuel.features.includes('Accès illimité aux articles'));

// Compter les features par plan
subscriptionPlans.value.forEach(plan => {
  console.log(`${plan.name}: ${plan.features.length} features`);
});
```

**Attendu:**
```
true
Plan Gratuit: 2 features
Plan Mensuel: 3 features
Plan Annuel: 5 features
```

---

## ✅ Checklist de Validation Finale

### Chargement
- [ ] Les 3 plans se chargent sans erreur
- [ ] Pas de message d'erreur en console
- [ ] L'état `plansLoading` passe de true à false

### Affichage
- [ ] Les noms des plans s'affichent
- [ ] Les prix s'affichent correctement (0€, 9.99€, 99.99€)
- [ ] Les durées s'affichent (30, 365)
- [ ] Les features s'affichent comme liste
- [ ] Les plans inactifs sont désactivés (s'il y en a)

### Types de données
- [ ] Prix: `typeof === 'number'`
- [ ] Durée: `typeof === 'number'`
- [ ] Features: `Array.isArray() === true`
- [ ] IDs: `typeof === 'string'`

### Interactivité
- [ ] Clic sur un plan → sélection enregistrée
- [ ] planId sélectionné est un string UUID
- [ ] Pas d'erreurs TypeScript
- [ ] Console clean (pas de warnings)

---

## 🔧 Troubleshooting

### Problème: Les plans ne se chargent pas

**Symptôme:** Page blanche ou loading infini

**Solutions:**
1. Vérifiez que l'API est accessible:
   ```bash
   curl http://localhost:3000/api/plans
   ```
   Devrait retourner: `{"data": [...], "meta": {...}}`

2. Vérifiez la console (F12) pour les erreurs réseau
3. Vérifiez que `nuxt.config.ts` a:
   ```typescript
   apiSubcriptionUrl: process.env.API_SUBSCRIPTION_URL || 'http://localhost:3000/api/'
   ```

### Problème: Les types sont mal formatés

**Symptôme:** Prix affichés comme strings, features non itérables

**Solution:**
- Vérifiez que `fetchPlans()` appelle `normalizePlan()`
- Vérifiez que les fonctions `parseFeatures()` et `normalizePlan()` sont présentes
- Recherchez dans le fichier: `Impossible de parser` (message d'erreur du parsing)

### Problème: Erreur "Features is not iterable"

**Symptôme:** Erreur en console quand on essaie d'utiliser features

**Solution:**
- Vérifiez en console: `Array.isArray(plan.features)`
- Vérifiez le format de la réponse API
- Vérifiez que `parseFeatures()` est appelée

---

## 📊 Fichiers modifiés

### Principal:
- `composables/useSubscription.ts`
  - ✅ Ajout: `parseFeatures()`
  - ✅ Ajout: `normalizePlan()`
  - ✅ Modification: `fetchPlans()` - applique normalization
  - ✅ Modification: `fetchPlan()` - applique normalization
  - ✅ Modification: `selectPlan()` - accepte string | number

### Types:
- `type/index.ts`
  - ✅ Ajout: `NormalizedPlan` interface
  - ✅ Ajout: `PlansApiResponse` interface
  - ✅ Ajout: `PlanApiResponse` interface
  - ✅ Ajout: `SubscriptionApiResponse` interface

### Documentation & Tests:
- `API_PLANS_INTEGRATION.md` - Documentation technique
- `composables/useSubscription.validation.ts` - Fichier de test
- `composables/useSubscription.real-api-examples.ts` - Exemples pratiques
- `PLANS_TESTING_GUIDE.md` - Ce fichier

---

## 🚀 Prochaines Étapes (Après Tests)

Si tous les tests passent ✅:

1. **Formulaire d'abonnement:**
   - Testez la création d'un abonnement
   - Vérifiez que planId UUID est bien envoyé

2. **Affichage des plans actuels:**
   - Testez `fetchCurrentSubscription()`
   - Vérifiez l'affichage de l'abonnement actif

3. **Renouvellement:**
   - Testez `renewSubscription()`
   - Vérifiez les changements de statut

4. **Annulation:**
   - Testez `cancelSubscriptionAPI()`
   - Vérifiez que le statut change

---

## 📞 Support

Si vous avez des questions:
1. Consultez `API_PLANS_INTEGRATION.md` pour les détails techniques
2. Consultez `composables/useSubscription.real-api-examples.ts` pour les exemples
3. Vérifiez les erreurs en console (F12)
4. Vérifiez que `nuxt.config.ts` est bien configuré

---

**Dernière mise à jour:** 14 décembre 2025
**Statut:** ✅ Prêt pour tester
