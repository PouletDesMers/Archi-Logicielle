# ADR-0001 : Architecture hexagonale pour le module Commande

- Date : 2026-10-12
- Statut : Accepté
- Décideurs : équipe ShopLite

## Contexte

Le module Commande dépend directement du framework HTTP et de l'ORM.
Les tests unitaires exigent une base de données réelle et prennent 12 minutes en CI.
Un second canal d'entrée (file de messages) doit bientôt déclencher des commandes.

## Décision

Isoler le domaine derrière des ports (`OrderRepository`, `Catalog`, `Notifier`)
et fournir des adaptateurs : HTTP et CLI (primaires), InMemory et PostgreSQL (secondaires).
La règle de dépendance est vérifiée en CI par `npm run lint:archi`.

## Conséquences

- (+) Tests du domaine en moins de 5 secondes, sans base de données
- (+) Nouveau canal d'entrée ajouté sans toucher au domaine
- (-) Plus de fichiers et d'indirections à comprendre pour un nouvel arrivant
- (-) Mapping explicite entre l'entité et le modèle de persistance

## Alternatives considérées

- Architecture en couches classique : rejetée (testabilité insuffisante)
- Microservice dédié : rejeté (coût d'exploitation disproportionné pour l'équipe)
