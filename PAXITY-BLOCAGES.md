# Paxity — blocages constatés et preuves

Business **Coumbassa & Sanden Conseil**, `developerAccountId` 284.
Constats du 2026-08-04, reproductibles.

L'intégration **mobile money fonctionne** : encaissement, lecture de statut,
solde et webhooks sont opérationnels sur `transaction.paxity.io`. Tout ce qui
suit concerne la carte bancaire et le widget.

---

## 1. Le paiement par carte — endpoint non documenté, et une erreur 500

**Correction du 2026-08-20.** Nos constats précédents portaient sur
`POST /transaction/pay-in-card`, seul endpoint carte que nous avions identifié.
Il répond 403. **Ce n'est pas celui que votre widget utilise.**

Le widget `card-widget.iife.js` appelle
**`POST /transaction/pay-in-card-bank`**, qui n'apparaît nulle part dans votre
documentation. Celui-là est bien ouvert à notre business :

| Appel | Réponse |
|---|---|
| `OPTIONS /transaction/pay-in-card-bank` | **200** + `Access-Control-Allow-Origin` |
| `POST /transaction/pay-in-card-bank` | authentifié, la transaction part |
| `OPTIONS` et `POST /transaction/pay-in-card` | **403** |

Deux demandes :

1. **Documenter `pay-in-card-bank`** : champs, en-têtes, réponse, statuts.
   Le champ `country` est obligatoire — omis, l'API répond
   `Cannot invoke "CountryCode.name()" because getCountry() is null`, une trace
   d'exception Java qui ne devrait pas remonter au client.
2. **Retirer ou documenter `pay-in-card`**, qui répond 403 et nous a fait
   conclure à tort que la carte n'etait pas habilitée.

### L'erreur qui nous bloque aujourd'hui

Requête complète et valide : la transaction est acceptée, puis échoue chez
votre prestataire.

```json
{"codeHttp":500,"codeIntern":"ERR_INTERNAL_SERVER",
 "message":"500 Internal Server Error from PATCH https://api.bictorys.com/pay/v1/charges/67c926f5-…"}
```

Reproduit avec Visa (`4111111111111111`) et Mastercard (`5555555555554444`),
avec et sans `customerEmail`/`customerPhone`. Une charge est créée chez
Bictorys à chaque tentative, puis le `PATCH` échoue. Pouvez-vous regarder ce
que deviennent ces charges, et nous indiquer **les numéros de test** à
utiliser ? Votre documentation n'en fournit aucun, ni environnement de test.

---

## 1 bis. Ancien constat (endpoint `pay-in-card`)

`POST /transaction/pay-in-card` répond **403** avec nos clés de production —
les mêmes qui fonctionnent sur tous les endpoints mobile money. Vérifié en
appel serveur direct, sans navigateur, donc sans CORS.

Le refus intervient dès le **préflight CORS**, quelles que soient l'origine et
la liste d'en-têtes demandée, alors que `pay-in-mobile` répond 200 et renvoie
bien l'origine :

| Endpoint (OPTIONS) | Réponse |
|---|---|
| `/transaction/pay-in-mobile` | 200 + `Access-Control-Allow-Origin` |
| `/payment-method` | 200 + `Access-Control-Allow-Origin` |
| `/transaction/pay-in-card` | **403**, aucun en-tête CORS |

L'endpoint est donc fermé à la passerelle pour ce business : aucun réglage
côté intégrateur ne peut le débloquer.

Autres endpoints refusés dans les mêmes conditions :

| Appel | Réponse |
|---|---|
| `POST /transaction/pay-in-card` | 403 |
| `POST /transaction/pay-in-method` | 403 |
| `GET /payment-method` | 200 ✅ |
| `GET /paxity/balance` | 200 ✅ |

Un 403 plutôt qu'un 404 indique que ces routes existent mais ne sont pas
ouvertes à ce business.

**Demandes :**
1. Activer le paiement par carte, ou indiquer les conditions à remplir.
2. Documenter le contrat de `pay-in-card` : champs, en-têtes, forme de la
   réponse, gestion du 3-D Secure, statuts possibles.
3. Préciser si la carte passe par un **flux hébergé** (redirection vers une
   page Paxity). Nous le privilégions fortement : collecter un PAN nous
   placerait dans le périmètre PCI-DSS, ce que nous voulons éviter.

---

## 1 ter. Moov Côte d'Ivoire absent du catalogue

`GET /payment-method` renvoie Moov Money pour le Burkina (`MOOVBF`), le Bénin
(`MOOVBJ`), le Mali (`MOOVML`) et le Togo (`MOOVTG`), mais **rien pour la Côte
d'Ivoire** — les seules entrées `CI` sont `MTNCI`, `WAVECI` et `OMCI`.

Moov Africa y est pourtant un opérateur majeur : les numéros en 01, 02 et 03
lui appartiennent. Nos clients ivoiriens sur Moov n'ont aujourd'hui d'autre
choix que Wave.

Pouvez-vous ajouter `MOOVCI`, ou nous indiquer ce qui l'en empêche ?

---

## 2. Deux widgets coexistent, la documentation renvoie vers le mauvais

Deux binaires sont servis sous `https://saas.paxity.io/widget/` :

| Fichier | Global exposé | Serveurs appelés | État |
|---|---|---|---|
| `card-widget.iife.js` | `window.PaxityWidget.open()` | `transaction.paxity.io`, `api.paxity.io` | **fonctionne** |
| `paxity-widget.iife.js` | `ReactPaymentModal` | `dev.paxity.io:6030` / `:6002` | inutilisable |

**La page « Widget » de votre documentation renvoie vers le second**, celui qui
appelle votre environnement de développement. Nous avons perdu un temps
considérable dessus avant de découvrir le premier dans un projet d'exemple.
Merci de corriger le lien de la documentation.

Les constats ci-dessous portent sur `paxity-widget.iife.js` (celui de la doc).

Source : `https://saas.paxity.io/widget/paxity-widget.iife.js` (4,16 Mo).

| La documentation annonce | Le bundle livré |
|---|---|
| `window.PaxityWidget.open({ amount, currency, credentials… })` | Aucun `PaxityWidget`. Le global est `ReactPaymentModal` |
| Options `amount`, `currency`, `country`, `credentials` | Composant React de props `{ token, isOpen }` |
| Intégrable dans n'importe quelle page | IIFE signée `function(React, ReactDOM)` : exige React **19** en globals |

Trois obstacles supplémentaires, non documentés, que nous avons dû résoudre
nous-mêmes pour seulement afficher le widget :

- **`ReferenceError: process is not defined`** — le bundle référence le global
  Node `process`, sa compilation n'a pas substitué `process.env.NODE_ENV`.
- **React 19 obligatoire** — il produit des éléments
  `react.transitional.element` ; React 18 échoue sur « Objects are not valid as
  a React child ». React 19 n'étant plus publié en UMD, il faut l'importer en
  ESM et l'exposer soi-même.
- **`saas.paxity.io` ne renvoie aucun en-tête CORS** — un `crossorigin` sur la
  balise `<script>` fait échouer le chargement, et toute erreur interne au
  bundle remonte en « Script error » opaque.

---

## 3. Le widget de la documentation appelle un serveur de développement

L'intégralité de ses appels pointe vers `https://dev.paxity.io:6030` et
`:6002`. Aucun n'utilise `transaction.paxity.io`. Résultat côté navigateur :

```
Access to XMLHttpRequest at 'https://dev.paxity.io:6030/api/v1/payment-method/cinet-pay/CI'
  → blocked by CORS policy: No 'Access-Control-Allow-Origin' header
GET https://dev.paxity.io:6002/merchant-service/api/v1/developer-accounts/284/payment-methods/countries
  → 401 (Unauthorized)
```

Le widget affiche alors « **Ce pays n'est pas activé pour ce marchand** ».

Vérifié hors navigateur, donc sans CORS :

| Appel | Nos clés production | Bearer codé en dur dans le bundle |
|---|---|---|
| `:6002 /developer-accounts/284/…` | **401** | **401** |
| `:6030 /payment-method/cinet-pay/CI` | **403** | — |

---

## 3 bis. Ce qui fonctionne avec `card-widget.iife.js`

Ce widget-là s'ouvre et appelle bien la production. Vérifié depuis un projet
Vite + React 19 :

```
200  https://transaction.paxity.io/api/v1/payment-method/country/CI
200  https://transaction.paxity.io/api/v1/country/
200  https://api.paxity.io/merchant-service/api/v1/developer-accounts/284/payment-methods/countries
```

Le formulaire carte s'affiche correctement. Deux réserves toutefois :

- **`developerAccountId` n'est jamais écrit** par le bundle, seulement relu
  dans `localStorage` (3 occurrences). Sans amorçage manuel, les appels partent
  vers `/developer-accounts/null/` et répondent 401. Il devrait être accepté en
  paramètre de `open()`.
- **Même incohérence de stockage** que l'autre bundle : les clés sont écrites
  dans `localStorage` mais un des clients axios les relit dans
  `sessionStorage`, d'où des en-têtes vides sur une partie des appels.

Et surtout, le paiement lui-même reste impossible — voir §1.

---

## 4. Signalements de sécurité

**Jeton d'authentification en dur dans le bundle public.** Le fichier
JavaScript contient un `Authorization: Bearer` statique — JWT HS512,
`{"sub":"SaaS","roles":["APP"],"iat":1740561473}`. N'importe qui peut le
télécharger. Nous ne l'avons pas utilisé au-delà d'un test de diagnostic, qui
a d'ailleurs répondu 401 : il semble révoqué. **À révoquer formellement s'il
ne l'est pas.**

**Les données de carte transitent par le navigateur, en clair, vers un serveur
de développement.** Le widget lit `cardNumber`, `cardCvv`,
`cardExpirationMonth` et `cardExpirationYear` depuis son formulaire, **les
journalise en clair dans la console du navigateur**, puis les poste vers
`dev.paxity.io:6030`. Combiné aux points ci-dessus, cela nous interdit
d'envisager ce widget pour un usage réel.

**Incohérence de stockage des clés.** Le widget écrit les identifiants dans
`localStorage.apiKey` / `localStorage.apiToken`, mais ses intercepteurs axios
les relisent dans `sessionStorage.apiKey` et `localStorage.apiKeyOldVersion`.
Les en-têtes `x-api-key` / `X-API-TOKEN` partent donc vides.

**Le token n'est pas vérifié.** Le `token` passé au widget est un JWT que
celui-ci se contente de décoder (`jwtDecode`), sans contrôle de signature. Sa
charge utile transporte `apiKey`, `apiToken`, `id`, `amount`, `currency`,
`country`, `ipn`, `callback`, `product`, `idClient`, `exp`. N'importe qui peut
en forger un.

---

## 5. Écarts mineurs relevés dans la documentation

| Constat | Documentation | Réalité de l'API |
|---|---|---|
| `Authorization: Bearer` | déclaré requis | non nécessaire ; `X-API-KEY` + `X-API-TOKEN` suffisent |
| Catalogue | 20 méthodes / 10 pays | 23 méthodes / 11 pays |
| `MPESAKE` | — | déclaré en devise `GHS` alors que le Kenya utilise `KES` |
| `idClient` | transmis à la création | jamais renvoyé par `GET /transaction/pay-in-mobile/{ref}` |
| `realAmount` | — | nombre à la création, chaîne à la relecture |
| `prefixPhone` | — | jamais renvoyé en lecture, même transmis à la création |
| Base d'URL | `api.paxity.com/v1` sur la page « API Direct » | `transaction.paxity.io/api/v1` partout ailleurs |

Existe-t-il par ailleurs un **environnement de test** ? La documentation n'en
mentionne aucun, ce qui nous oblige à valider en production.
