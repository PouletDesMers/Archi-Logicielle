# TP 4 — Panachage de patterns (justification)

Composition finale : **Fabrique ouverte + Builder** côté notifications,
**Adapter + Décorateur + Façade** côté transport.

## 1. Fabrique ouverte / registre — `notifications/channels.js` + `slack.js`

- **Intention** : créer un canal par son nom (`createChannel('sms')`) sans que le code
  appelant connaisse les classes, et pouvoir en ajouter un sans rouvrir le fichier.
- **Avant** : un `if/else if` par canal dans une fonction `send()`. Ajouter Slack =
  modifier la fabrique, retester tous les canaux (violation OCP).
- **Ici** : `registerChannel(nom, fabrique)` remplit une `Map` ; `createChannel()` lit la
  `Map`. `slack.js` s'enregistre à l'import → `channels.js` n'a pas bougé.
- **SOLID** : OCP (extension sans modification), DIP (l'appelant dépend du nom/contrat
  `send(message)`, pas d'une classe concrète).
- **Limite assumée** : l'enregistrement à l'import est un effet de bord. Si le canal ne
  doit pas être chargé partout, préférer un import explicite et un appel à
  `registerSlackChannel()` dans la composition (`main.js`).

## 2. Builder — `notifications/MessageBuilder.js`

- **Intention** : construire un message lisible qui a 4 champs dont 2 obligatoires, puis
  le figer (`Object.freeze`).
- **Avant** : `send(to, subject, body, priority, locale, replyTo…)` : on ne sait plus
  quel argument est lequel, et on peut envoyer un message incohérent (sujet vide).
- **Ici** : API fluide (`.subject().line().priority().build()`), validation au `build()`,
  objet immuable : personne ne modifie le message après coup.
- **Piège évité** : un builder muté après `build()` ne change pas le message déjà produit
  (chaque `build()` renvoie un nouvel objet figé).

## 3. Adapter — `shipping/adapters.js`

- **Intention** : imposer un contrat maison `quote(order) → {carrier, priceEur, transitDays}`
  à des API écrites dans une autre langue.
- **Avant** : le métier appelait `colissimo.tarif({poidsGrammes, codePostal})` et
  `dhl.getRate(weightKg, zip)` avec des `if` sur le transporteur, en convertissant les
  unités à chaque endroit.
- **Ici** : `ColissimoAdapter` absorbe kg→g, centimes→euros, synchrone→`async` ;
  `DhlAdapter` absorbe kg, `"9.80"`→`9.8`, asynchrone. Les API fournies ne changent pas.
- **SOLID** : OCP (nouveau transporteur = nouvelle classe), LSP (tous interchangeables
  derrière le même contrat), DIP (le service dépend de `quote()`, pas des API).
- **Détail** : même une API synchrone est enveloppée en `async` — un seul contrat, donc
  les décorateurs se composent sans `if`.

## 4. Décorateur — `shipping/decorators.js`

- **Intention** : ajouter du comportement (retry, cache) à un devis **sans** toucher aux
  adapters ni créer une sous-classe par combinaison.
- **Avant** : `DhlAdapterWithRetryCache extends DhlAdapter`, puis
  `ColissimoAdapterWithRetryCache`… une classe par combinaison (explosion combinatoire).
- **Ici** : `RetryQuote` et `CachedQuote` partagent le contrat `quote()` et encapsulent.
- **L'ordre compte** :
  `CachedQuote(RetryQuote(Dhl))` → 1 échec + 1 succès, puis cache ⇒ 2 appels réseau au total.
  `RetryQuote(CachedQuote(Dhl))` → le cache mémorise l'échec (ou le rejoue) et les
  tentatives ne redeviennent pas des essais réels. Règle retenue : **retry à l'intérieur,
  cache à l'extérieur**.
- **Détail** : `CachedQuote` mémorise la *promesse*, pas la valeur → deux appels
  concurrents ne déclenchent qu'un aller-retour. Un échec est retiré du cache pour ne pas
  figer un incident.
- **SOLID** : OCP, SRP (retry, cache et transport sont trois fichiers distincts).

## 5. Façade — `shipping/ShippingService.js`

- **Intention** : une porte d'entrée pour le reste de l'application :
  `best(order)`, `fastest(order)`, `quotes(order)`.
- **Avant** : le controller devait connaître la liste des transporteurs, composer les
  décorateurs, gérer `Promise.allSettled` et comparer les prix.
- **Ici** : validation de la commande au même endroit, isolation des pannes
  (`un transporteur en échec ne fait pas tomber les autres`), tri déterministe
  (prix, puis délai, puis nom).
- **Ce n'est pas** un « god object » : la façade ne calcule rien, elle orchestre.

## Ce qui a été ajouté sans être modifié

| Besoin | Fichier touché | Fichier **non** modifié |
|---|---|---|
| Canal Slack | `notifications/slack.js` (nouveau) | `notifications/channels.js` |
| Transporteur supplémentaire | `shipping/adapters.js` (nouvelle classe) | `carrierApis.js`, `ShippingService.js` |
| Politique de résilience | `shipping/decorators.js` | adapters, façade |
| Nouveau format de message | `MessageBuilder` | canaux (ils reçoivent le même `{subject, body}`) |

## Ce que je ne ferais pas ici

- Une classe abstraite `AbstractCarrierFactoryProxyStrategy` : à 2 transporteurs et 2
  décorateurs, l'indirection coûterait plus qu'elle ne rapporte.
- Injecter un conteneur DI : `main.js` fait la composition à la main, en 20 lignes
  lisibles. Le conteneur se justifie quand le graphe devient profond.
