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
adapters ramènent les deux à `quote(order) -> { carrier, priceEur, transitDays }` et font les
conversions. Tout est `async`, même Colissimo : le reste du code n'a plus à savoir lequel est
lent.

## Retry et cache : des décorateurs

Plutôt qu'une classe par combinaison (`DhlAdapterWithRetryAndCache`…), `RetryQuote` et
`CachedQuote` enveloppent le transporteur avec le même `quote()`.

L'ordre compte : `CachedQuote(RetryQuote(dhl))` donne un échec, un succès, puis plus rien.
L'inverse mémorise l'échec et le retry ne sert plus à rien. Le cache garde la promesse (deux
appels simultanés = un seul aller-retour) et retire l'entrée quand ça échoue.

## Façade

`ShippingService` valide la commande, interroge tous les transporteurs
(`Promise.allSettled` : un échec n'empêche pas les autres de répondre) et trie par prix, puis
délai, puis nom. `best()` et `fastest()` suffisent côté application.

## Bilan

Ajouter Slack = un fichier. Ajouter un transporteur = une classe dans `adapters.js`, sans
toucher à `carrierApis.js`. Ajouter du retry = un décorateur. Aucun code existant n'a été
rouvert.


