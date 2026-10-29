# ADR 0002 Stratégie de synchronisation optimiste avec résolution semi-automatique des conflits hors ligne

- **Statut :** Proposé
- **Date :** 2026-10-30
- **Auteurs :** Clément Droual & RAMANAMPAMONJY Riantsoa Lahatriniaina
- **Spécialité :** Dev
- **Élément du C4 concerné :** Flèche *App Mobile Terrain -> API Centrale ("Synchronise les inspections et lots de données")*

## Contexte
Les apiculteurs interviennent sur des ruchers situés en zones blanches (sans couverture 3G/4G). Le cahier des charges impose une saisie locale intégrale (UC-A01) avec réconciliation différée. Plusieurs techniciens ou vétérinaires peuvent inspecter ou modifier l'état d'un rucher dans le même intervalle temporel. Un écrasement silencieux ("Last Write Wins") entraînerait une perte critique de traçabilité sanitaire.

## Options considérées
1. **Option A : Verrouillage pessimiste distribué (Distributed Locking).** La ruche est verrouillée sur le central avant le départ sur le terrain.
   - *Avantages :* Élimine les conflits de synchronisation à la racine.
   - *Inconvénients :* Inapplicable en cas de panne réseau imprévue ou d'oubli de déverrouillage ; bloque les autres intervenants.
2. **Option B : Concurrence optimiste par versioning vectoriel/ETag et résolution applicative semi-automatique (Retenue).** L'API valide un numéro de version (`versionToken`). Si divergence, les champs orthogonaux fusionnent automatiquement ; les attributs vitaux conflictuels déclenchent un écran de réconciliation sur le mobile.
   - *Avantages :* Disponibilité totale hors ligne, non-blocant, aucune perte de données sanitaires.
   - *Inconvénients :* Complexité d'implémentation de la fusion différentielle sur le client et l'API.
3. **Option C : CRDT (Conflict-free Replicated Data Types) pures.** Structure de données mathématiquement convergente sans coordination centrale.
   - *Avantages :* Résolution automatique garantie mathématiquement sans rejet HTTP 409.
   - *Inconvénients :* Overhead de stockage sur mobile, inadapté aux règles d'intégrité métier strictes (ex: transition d'états d'alerte sanitaire).

## Décision
Retenir l'**Option B (Concurrence optimiste avec versioning et résolution semi-automatique)**. Cette option maximise la robustesse opérationnelle sur le terrain tout en protégeant les règles métier (voir justification chiffrée dans `docs/evaluation/matrice.md`).

## Conséquences
- **Positives :** L'application reste utilisable à 100% sans réseau ; intégrité transactionnelle garantie sur le SGBD central.
- **Négatives :** Nécessite la conception d'un écran de réconciliation dédié dans Flutter en cas de rejet 409.
- **À surveiller :** Taux de conflits 409 hebdomadaires (seuil d'alerte : > 2% des synchronisations).

## Révision
Rouvrir la décision si le taux de conflits réels sur le terrain dépasse 5% sur un mois ou si l'UX de réconciliation manuelle génère un taux d'abandon supérieur à 1%.
