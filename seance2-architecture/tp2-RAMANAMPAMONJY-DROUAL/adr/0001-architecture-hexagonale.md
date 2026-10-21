# ADR-0001 : architecture hexagonale pour la prise de commande

- Date : 2026-10-21
- Statut : Accepté
- Décideurs : équipe du module ShopLite

## Contexte
Le paiement est simulé aujourd'hui par `FakePayment`, mais un vrai prestataire
de paiement pourra être intégré plus tard. De même, le stockage en mémoire
pourra être remplacé par une base PostgreSQL. Le domaine et le cas d'utilisation
doivent donc rester indépendants de ces choix techniques et de HTTP.

## Décision
Nous adoptons une architecture hexagonale : `Order` contient les règles métier,
`PlaceOrder` orchestre le cas d'utilisation et les adaptateurs sont injectés par
le composition root dans `main.js`.

## Conséquences
- (+) Un prestataire de paiement réel peut remplacer `FakePayment` sans modifier le domaine.
- (+) `InMemoryOrderRepository` peut être remplacé par PostgreSQL sans modifier `PlaceOrder`.
- (+) Le domaine et le cas d'utilisation sont testables sans serveur HTTP ni infrastructure réelle.
- (-) Il faut définir et maintenir des ports, puis câbler davantage de composants.
- (-) La structure comporte plus de fichiers et demande une compréhension des adaptateurs.

## Alternatives considérées
- Architecture en couches classique : rejetée parce qu'elle tend à faire dépendre les
	services métier du stockage ou du paiement, ce qui rend leurs remplacements et tests
	plus coûteux.
