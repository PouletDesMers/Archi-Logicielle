# Description et justification des conteneurs de QueenBee

Ce document répertorie l'ensemble des conteneurs du modèle C4 niveau 2 de QueenBee, justifie leur isolation technique et physique (selon les critères acceptés : lieu d'exécution, rythme de charge, cycle de vie/langage, persistance ou public cible), et positionne les Bounded Contexts identifiés.

---

| Conteneur | Technologie | Pourquoi séparé ? | Contextes hébergés | Données stockées |
| :--- | :--- | :--- | :--- | :--- |
| **App Mobile Terrain** | Flutter / SQLite | **Autre lieu d'exécution** (terminaux mobiles sur le terrain en zone blanche) et **autre mode de fonctionnement** (offline-first avec stockage local obligatoire). | Saisie terrain, Consultation locale du rucher | Relevés d'inspection non synchronisés, cache local des ruchers et ruches assignés. |
| **Portail Web Métier** | React / TypeScript (SPA) | **Autre public cible** (coordinateurs régionaux, vétérinaires, administrateurs) et **cycle de vie découplé** de l'API (déploiement continu des interfaces web, navigation bureautique). | Supervision sanitaire, Planification logistique, Administration | Aucune (client riche sans état côté serveur, cache navigateur temporaire). |
| **API Centrale** | Node.js 22 / Fastify | **Cœur transactionnel sans état** hébergeant la logique métier centrale ; scalabilité horizontale indépendante des bases et des workers. | Modules métier : *Santé & Ruches*, *Planification*, *Inspections*, *IAM & Contexte* (Monolithe modulaire) | Aucune (sans état, délègue la persistance à la base relationnelle et au stockage d'objets). |
| **Passerelle de Site (Edge)** | Go / SQLite local | **Autre lieu d'exécution** (déployée physiquement sur chaque site/rucher) ; absorption des protocoles matériels (LoRaWAN) et maintien du fonctionnement en cas d'isolement réseau prolongé. | Ingestion IoT locale, Prétraitement et tampon télémétrique | Données de pesée, température et humidité en attente de téléversement (buffer local). |
| **Moteur d'Escalade** | Node.js Worker | **Autre rythme de charge et d'exécution** (tâches de fond planifiées, traitement asynchrone des politiques d'escalade à 48h sans bloquer l'API synchrone). | Gestion des Alertes et Escalades | Aucune (lit les états en attente dans la BDD et publie vers le broker ou la passerelle SMS). |
| **Message Broker** | Mosquitto MQTT | **Autre protocole et dissociation temporelle** : gestion des flux télémétriques asynchrones à haut débit et découplage producteur/consommateur. | Événements asynchrones et télémétrie | Messages en transit (mémoire volatile / files temporaires de messages). |
| **Base de Données Centrale** | PostgreSQL 16 | **Stockage de données persistant** : garantie de cohérence transactionnelle forte (ACID) pour le référentiel métier complet. | Données transverses de tous les modules centraux (schémas modulaires isolés) | Ruchers, ruches, historique des inspections, affectations de tournées, comptes utilisateurs, événements sanitaires. |
| **Stockage d'Objets** | MinIO (API compatible S3) | **Stockage de données volumineuses non relationnelles** : optimisation des coûts et performances d'accès pour les fichiers binaires sans saturer la base SQL. | Pièces jointes et médias sanitaires | Photos des cadres de ruches, exports PDF des rapports vétérinaires, archives compressées. |

---

## Règles d'architecture appliquées

1. **Monolithe modulaire au central :** Conformément aux bonnes pratiques du TP, chaque Bounded Context ne correspond pas à un microservice indépendant. Les contextes *Santé*, *Planification*, *Inspections* et *IAM* cohabitent au sein de l'API Centrale sous forme de modules avec ports et adaptateurs dédiés, partageant la même instance PostgreSQL sans couplage direct entre tables.
2. **Critères de découpage stricts :** Aucun conteneur n'a été créé par simple convenance stylistique. Chaque séparation répond à une contrainte physique (terrain / edge vs cloud), de protocole (LoRaWAN / MQTT vs HTTP) ou de spécialisation de données (relationnel ACID vs stockage binaire S3).