# ADR 0003 : Utilisation de TimescaleDB sur PostgreSQL pour l'historique des métriques IoT

- **Statut :** Accepté
- **Date :** 2026-10-23
- **Auteurs :** Clément Droual & RAMANAMPAMONJY Riantsoa Lahatriniaina
- **Spécialité :** Dev
- **Élément du C4 :** Conteneur *Base de Données Centrale [PostgreSQL 16]*

## Contexte
Les ruches connectées transmettent en continu des mesures environnementales (température, humidité, masse/pesée) via les passerelles de site (UC-T02). Le système doit absorber ces flux temporels, autoriser des requêtes d'agrégation rapides pour la détection d'alertes sanitaires et corréler ces métriques avec les données relationnelles des ruchers et inspections.

## Options considérées
1. **Option A : PostgreSQL relationnel natif sans extension.**
   - *Avantages :* Aucun composant supplémentaire à installer ou configurer.
   - *Inconvénients :* Dégradation rapide des performances sur les requêtes temporelles volumineuses, partitionnement manuel complexe à administrer.
2. **Option B : Extension TimescaleDB au sein du cluster PostgreSQL existant (Retenue).**
   - *Avantages :* Hypertables optimisées pour les séries temporelles, compression native des données historiques, conservation du langage SQL standard et compatibilité relationnelle directe.
   - *Inconvénients :* Consommation mémoire accrue lors des pics d'écriture continue.
3. **Option C : Déploiement d'une base Time-Series dédiée (ex. InfluxDB).**
   - *Avantages :* Optimisation pure pour la télémétrie de capteurs.
   - *Inconvénients :* Coût d'administration d'un SGBD additionnel, nécessité de jointures applicatives complexes entre InfluxDB et PostgreSQL.

## Décision
Adoption de l'**Option B (TimescaleDB)**. Cette approche conserve l'infrastructure de stockage unique (PostgreSQL 16) tout en apportant les performances nécessaires aux calculs de dérive de poids et de température.

## Conséquences
- **Positives :** Requêtes analytiques accélérées pour le moteur d'escalade, absence de synchronisation multi-bases, politique de rétention automatisée.
- **Négatives :** Dépendance vis-à-vis des binaires de l'extension TimescaleDB lors des montées de version du moteur SGBD.
- **À surveiller :** Volume disque consommé par les hypertables et temps d'exécution des agrégations glissantes sur 7 jours.

## Révision
Rouvrir si le volume d'ingestion dépasse 50 000 points de mesure par seconde ou si la rétention brute impose une séparation matérielle des disques d'analytique.
