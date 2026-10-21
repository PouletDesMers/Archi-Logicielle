# ADR 0001 : architecture hexagonale

## Contexte

Le cas d'utilisation de commande doit rester indépendant de HTTP, du stockage,
du catalogue, du paiement et des notifications.

## Décision

Le domaine contient l'entité `Order` et ses invariants, sans import technique.
`PlaceOrder` orchestre le cas d'utilisation et reçoit ses ports sortants par
injection. Les adaptateurs primaires pilotent le cas d'utilisation, tandis que
les adaptateurs secondaires implémentent le stockage, le catalogue, le paiement
et la notification. `main.js` assemble les dépendances sur le port 3001.

## Conséquences

Les tests du domaine et du cas d'utilisation s'exécutent sans serveur HTTP.
Un adaptateur de paiement peut être remplacé sans modifier le domaine.
