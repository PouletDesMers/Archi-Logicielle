# Glossaire QueenBee · groupe Dev-1

> Règle appliquée : un mot présent dans deux contextes avec deux sens a **deux lignes**.
> C'est le signe que le découpage en bounded contexts fonctionne.

| Terme | Définition validée | Contexte | Dans le code | Source |
|---|---|---|---|---|
| **Alerte** (colonie) | Signal émis par le contexte Santé des colonies quand une règle de risque est franchie pour une colonie ; porte un type de risque, un niveau de confiance et un cycle de vie (LEVÉE → PRISE_EN_CHARGE → RÉSOLUE, ou ESCALADÉE). | Santé des colonies | `Alerte`, `TYPES_DE_RISQUE` | UC-A02 |
| **Alerte** (infrastructure) | Signal technique émis par la supervision : passerelle muette, capteur silencieux, brouillage radio, trame rejouée. Ne suit pas le cycle de vie « prise en charge / résolue » mais « ouvert / investigué / clos ». | Supervision et sécurité | `AlerteTechnique` | UC-CY01, UC-CY02, UC-CY03 |
| **Type de risque** | Nature du danger détecté sur une colonie : `ESSAIMAGE`, `AFFAIBLISSEMENT`, `STRESS_THERMIQUE`, `MORTALITE`. Vocabulaire fermé, partagé avec la Prévision. | Santé des colonies | `TYPES_DE_RISQUE` | UC-A02 |
| **Confiance** | Probabilité, entre 0 et 1, que le modèle attache à un risque détecté ; affichée à l'apicultrice avec la recommandation. | Santé des colonies / Prévision | `confiance` | UC-A02 |
| **Seuil** | Valeur de mesure (ou écart en %) au-delà de laquelle une mesure est jugée anormale. Paramétrable par type de ruche et par site. | Collecte & Ingestion | `seuil` | CDC 3.2 (Admin) |
| **Mesure** | Relevé brut agrégé par la passerelle : poids, températures, humidité, score d'activité acoustique. Non encore validé. | Collecte & Ingestion | `Mesure` | UC-T02 |
| **Mesure validée** | Mesure ayant franchi la validation physique et la déduplication ; c'est elle, et elle seule, que les autres contextes consomment. | Collecte & Ingestion | `MesureValidée` | UC-T02, UC-CY02 |
| **Trame** | Payload radio compact (LoRaWAN) émis par un capteur et relayé par la passerelle du site ; encodage binaire, ~20 octets. | Collecte & Ingestion | `Trame` | CDC 6.4, 6.5 |
| **Ruche** (référentiel) | Équipement physique identifié `PP-SITE-NNN`, rattaché à un site et à une coopérative, avec une position GPS de référence. N'existe qu'une fois. | Référentiel & Accès | `Ruche` | CDC 7.1 |
| **Colonie** (unité de suivi) | Objet vivant observé : score de santé, alertes, inspections, historique. Une ruche peut changer de colonie après une transhumance. | Santé des colonies | `ColonieSuivie` | UC-A02, CDC 7.1 |
| **Site** | Ensemble de ruchers d'un même lieu (8 sites, 3 pays), rattaché à une coopérative ; unité de découpage des droits et de la supervision. | Référentiel & Accès | `Site` | CDC 3.1, 6.3 |
| **Coopérative** | Organisation locale qui rassemble les apicultrices d'un territoire ; destinataire des notifications de récolte. | Référentiel & Accès | `Cooperative` | UC-A03 |
| **Inspection** | Relevé terrain saisi par une apicultrice (état visuel, présence de la reine, comportement, photo), possible hors ligne. | Terrain & visites | `Inspection` | UC-A01 |
| **Visite** | Créneau de passage planifié par un coordinateur, priorisé par le risque et la géolocalisation, puis assigné à une apicultrice. | Terrain & visites | `Visite` | UC-C01 |
| **Récolte** | Volume de miel déclaré par une apicultrice pour une ruche, à une date donnée. | Production & récoltes | `Recolte` | UC-A03 |
| **Écart de rendement** | Différence, en %, entre la récolte déclarée et la prédiction de rendement ; au-delà de 20 % l'écart est mis en investigation. | Production & récoltes | `ecartRendement` | UC-A03, UC-C02 |
| **Prédiction de rendement** | Volume attendu calculé par le modèle pour une ruche et une saison ; versionnée et immuable une fois publiée. | Prévision | `PredictionRendement` | UC-A03 |
| **Score de santé** | Note agrégée (0–1) de l'état d'une colonie, recalculée à chaque mesure validée ; sert au classement des ruches par risque. | Santé des colonies | `scoreSante` | UC-C01, UC-A02 |
| **Escalade** | Passage automatique d'une alerte restée LEVÉE 48 h sans prise en charge à un niveau supérieur (coordinateur). | Santé des colonies | `escalader()`, `ESCALADÉE` | Énoncé TP5 |
| **Prise en charge** | Acceptation explicite d'une alerte par une apicultrice : elle en devient responsable et travaille dessus. | Santé des colonies | `assigner()`, `PRISE_EN_CHARGE` | Énoncé TP5 |
| **Résolution** | Clôture d'une alerte après une inspection ; exige l'identifiant de l'inspection qui la justifie. | Santé des colonies | `resoudre()`, `RÉSOLUE` | Énoncé TP5 |
| **Validation** (d'une récolte) | Acceptation par le coordinateur après comparaison aux poids mesurés ; une récolte validée ne se modifie plus. | Production & récoltes | `recolte.valider()` | UC-C02 |
| **Validation** (d'une trame) | Contrôle automatique à l'ingestion : plages physiques, unicité `(hive_id, timestamp)`, authenticité du capteur. | Collecte & Ingestion | `validerTrame()` | UC-CY02 |
| **Signalement d'écart** | Décision du coordinateur de mettre un écart de rendement en investigation ; exige un commentaire. | Production & récoltes | `signalerEcart()` | UC-C02 |
| **Transhumance** | Déplacement **déclaré** d'une ruche (migration saisonnière) ; permet de distinguer un déplacement légitime d'un vol. | Référentiel & Accès | `Transhumance` | UC-CY04 |
| **Incident** | Événement technique nécessitant une réponse : passerelle muette, rejeu de trame, brouillage, déplacement non déclaré. | Supervision et sécurité | `Incident` | UC-CY01…CY04 |
| **Passerelle** | Concentrateur LoRaWAN d'un site : agrège les trames, met en cache localement, émet un heartbeat toutes les 15 min. | Collecte & Ingestion | `Passerelle` | UC-T02, UC-CY01 |
| **Point chaud** | Question ouverte du mur (désaccord, information manquante). Ne bloque pas l'atelier ; devient un ADR si une décision est requise. | (méthode) | — | Énoncé TP5 |

## Mots à plusieurs sens (décisions prises)

- **« Alerte »** : sens 1 = alerte de **santé de colonie** (cycle prise en charge / résolution, 48 h, apicultrice) ; sens 2 = alerte **d'infrastructure** (passerelle, brouillage, trame rejouée, cycle ouvert / clos, équipe Cyber). → **Décision** : deux contextes distincts (`Santé des colonies` et `Supervision et sécurité`), deux agrégats, deux tables. C'est le point qui a justifié la frontière.
- **« Validation »** : sens 1 = validation **métier** d'une récolte par un coordinateur ; sens 2 = validation **technique** d'une trame à l'ingestion. → **Décision** : la validation métier vit dans `Production & récoltes`, la validation technique dans `Collecte & Ingestion`. Ne jamais réutiliser le même mot dans les deux.
- **« Ruche »** : sens 1 = équipement du référentiel (identifiant, site, position de référence) ; sens 2 = colonie suivie (score, alertes, inspections). → **Décision** : `Ruche` appartient au référentiel ; le suivi de santé porte sur une `Colonie`, ce qui permet à une ruche de changer de colonie (transhumance, essaimage suivi).
- **« Site »** : sens 1 = lieu physique (rucher, passerelle, zone réseau) ; sens 2 = périmètre de droits (un coordinateur ne voit que son site). → **Décision** : un seul agrégat `Site` dans le référentiel, mais deux usages : géographique (Collecte, Supervision) et sécuritaire (Référentiel & Accès).
