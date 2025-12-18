/**
 * Validation et tests pour useSubscription.ts
 * Teste le parsing des données réelles de l'API
 */

// Données réelles de l'API
const API_RESPONSE = {
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
    },
    {
      "id": "e4609624-47af-4147-a701-396ef6130542",
      "name": "Plan Mensuel",
      "description": "Accès complet mensuel",
      "price": "9.99",
      "duration": 30,
      "features": "[\"Accès illimité aux articles\",\"Newsletter hebdomadaire\",\"Sans publicité\"]",
      "isActive": true,
      "createdAt": "2025-12-13T20:28:21.565Z",
      "updatedAt": "2025-12-13T20:28:21.565Z"
    },
    {
      "id": "e5e96924-1045-4315-9257-c7cc7e11532c",
      "name": "Plan Annuel",
      "description": "Accès complet annuel avec réduction",
      "price": "99.99",
      "duration": 365,
      "features": "[\"Accès illimité aux articles\",\"Newsletter quotidienne\",\"Sans publicité\",\"Contenu exclusif\",\"Support prioritaire\"]",
      "isActive": true,
      "createdAt": "2025-12-13T20:28:22.154Z",
      "updatedAt": "2025-12-13T20:28:22.154Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}

/**
 * Fonction de parsing identique à celle dans useSubscription.ts
 */
function parseFeatures(features: any): string[] {
  if (Array.isArray(features)) {
    return features
  }
  if (typeof features === 'string') {
    try {
      return JSON.parse(features)
    } catch (e) {
      console.warn('Impossible de parser les features:', features)
      return []
    }
  }
  return []
}

/**
 * Fonction de normalisation identique à celle dans useSubscription.ts
 */
function normalizePlan(plan: any) {
  return {
    ...plan,
    price: parseFloat(String(plan.price)) || 0,
    features: parseFeatures(plan.features),
    duration: parseInt(String(plan.duration)) || 30
  }
}

/**
 * Tester le parsing des plans
 */
export function testPlansParsing() {
  console.log('=== Test de Parsing des Plans ===\n')

  const plans = API_RESPONSE.data
  const normalizedPlans = plans.map(normalizePlan)

  console.log('Nombre de plans:', normalizedPlans.length)
  console.log('')

  normalizedPlans.forEach((plan, index) => {
    console.log(`Plan ${index + 1}: ${plan.name}`)
    console.log(`  ID: ${plan.id}`)
    console.log(`  Prix: ${plan.price}€ (Type: ${typeof plan.price})`)
    console.log(`  Durée: ${plan.duration} jours (Type: ${typeof plan.duration})`)
    console.log(`  Actif: ${plan.isActive}`)
    console.log(`  Features:`, plan.features)
    console.log('')
  })

  // Validation
  console.log('=== Validation ===\n')
  
  let isValid = true

  // Vérifier les prix
  const prices = normalizedPlans.map(p => p.price)
  console.log('✓ Prix:', prices)
  if (prices.every(p => typeof p === 'number')) {
    console.log('  ✓ Tous les prix sont des nombres')
  } else {
    console.log('  ✗ ERREUR: Certains prix ne sont pas des nombres')
    isValid = false
  }

  // Vérifier les features
  console.log('\n✓ Features parsées:')
  normalizedPlans.forEach((plan, index) => {
    console.log(`  ${index + 1}. ${plan.name}: ${plan.features.length} features`)
    if (plan.features.length === 0) {
      console.log('     ✗ ERREUR: Aucune feature parsée')
      isValid = false
    } else {
      console.log(`     ✓ Features: ${plan.features.join(', ')}`)
    }
  })

  // Vérifier les durées
  console.log('\n✓ Durées:', normalizedPlans.map(p => p.duration))
  if (normalizedPlans.every(p => typeof p.duration === 'number')) {
    console.log('  ✓ Toutes les durées sont des nombres')
  } else {
    console.log('  ✗ ERREUR: Certaines durées ne sont pas des nombres')
    isValid = false
  }

  console.log('\n' + (isValid ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ ERREURS DÉTECTÉES'))
  console.log('')

  return {
    plans: normalizedPlans,
    isValid
  }
}

// Exécuter les tests si le fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testPlansParsing()
}
