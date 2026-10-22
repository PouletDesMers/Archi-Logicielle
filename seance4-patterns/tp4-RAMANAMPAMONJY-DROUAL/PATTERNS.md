# TP 4 — pourquoi ces patterns

## Canaux : une Map, pas un switch

`createChannel('sms')` fabrique le canal à partir de son nom : `registerChannel(type, Classe)`
remplit une `Map`, `createChannel` fait un `new Classe()`. Avec un `switch`, ajouter Slack
aurait obligé à rouvrir `channels.js` et à retester les trois autres canaux. Là, `slack.js` se
contente de s'enregistrer à l'import. Et `registerChannel` vérifie que la classe hérite de
`Channel` : l'erreur se voit à l'enregistrement, pas au premier `send()`.

## Message : un builder

`send(to, body, priority)` s'inverse facilement. Le builder rend le message lisible
(`.to().template().with().priority()`), remplit le gabarit à `build()` et renvoie un objet
figé : le message envoyé ne bouge plus.

## Transporteurs : deux adapters, un contrat

`carrierApis.js` est fourni et intouchable. Colissimo est synchrone, en grammes et centimes ;
DHL est asynchrone, en kilos, avec un montant en texte et un 503 de temps en temps. Les
adapters ramènent les deux à `getQuote({ weightKg, zip }) -> { carrier, price, days }` et font
les conversions. Le résultat est gelé et tout est `async`, même Colissimo : le reste du code
n'a plus à savoir lequel est lent.

## Retry et cache : des décorateurs

Plutôt qu'une classe par combinaison (`DhlAdapterWithRetryAndCache`…), `RetryQuote` et
`CachedQuote` enveloppent le transporteur avec le même `getQuote()`.

L'ordre compte : `CachedQuote(RetryQuote(dhl))` donne un échec, un succès, puis plus rien.
Le cache doit envelopper le retry : il ne mémorise alors que le devis final réussi. Dans
l'ordre inverse, un échec peut être mis en cache et les appels suivants ne relanceraient
jamais les tentatives de récupération. Le cache garde aussi la promesse (deux appels
simultanés = un seul aller-retour), expire après `ttlMs` et retire l'entrée quand ça échoue.

## Façade

`ShippingService` valide la commande, interroge tous les transporteurs en parallèle
(`Promise.allSettled` : un échec n'empêche pas les autres de répondre) et choisit avec
`bestQuote()` par prix, puis délai. Une liste vide ou entièrement en panne produit
`Aucun transporteur disponible`.

## Bilan

Ajouter Slack = un fichier. Ajouter un transporteur = une classe dans `adapters.js`, sans
toucher à `carrierApis.js`. Ajouter du retry = un décorateur. Aucun code existant n'a été
rouvert.

