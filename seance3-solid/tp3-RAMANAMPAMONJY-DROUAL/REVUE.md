# Revue croisée

## Qualités

- Le calcul métier est isolé dans `domain/salesStats.js` et reste pur : il est
  testable avec un simple tableau de commandes, sans fichier ni console.
- L’ajout du format Markdown est limité à l’enregistrement d’un objet
  `format(stats)` dans le registre ; `ReportService.js` n’a pas été modifié
  pour ce nouveau format.

## Améliorations

- Les tests de caractérisation utilisent encore `buildReportService()` et le
  dépôt JSON réel. Des tests unitaires supplémentaires avec un faux dépôt
  permettraient de vérifier `ReportService` sans dépendre de `orders.json`.
- `SmtpMailer` conserve une boîte d’envoi en mémoire pour la démonstration.
  Dans une application réelle, il faudrait masquer les détails SMTP et tester
  l’adaptateur avec un faux transport dédié.
