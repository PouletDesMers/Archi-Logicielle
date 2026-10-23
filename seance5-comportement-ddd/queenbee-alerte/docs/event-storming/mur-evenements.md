# Mur Event Storming QueenBee · groupe Dev-1

> Transcription du mur Miro `QueenBee · ES · Dev-1` (export de secours, lisible en texte).
> Légende : **Événement** (passé) · Commande (impératif) · Acteur (personne) · Système externe
> (capteur, passerelle, modèle, météo) · Politique (« quand…, alors… ») · Agrégat · Point chaud.
> 60 événements, 12 agrégats, 12 politiques, 12 points chauds.

## Légende du mur

| Couleur | Élément | Exemple |
|---|---|---|
| 🟧 | Événement métier (passé) | `Récolte déclarée` |
| 🟦 | Commande (impératif) | `Déclarer une récolte` |
| 🟨 | Acteur (personne avec un rôle) | Apicultrice, Coordinateur, Gestionnaire, Administrateur |
| 🟪 | Agrégat | `Récolte`, `Alerte`, `Passerelle` |
| 🟫 | Politique (« quand <événement>, alors <commande> ») | 48 h sans prise en charge → escalader |
| 🩷 | Système externe | Passerelle LoRaWAN, OpenWeatherMap, service de notification |
| 🟥 | Point chaud | voir `points-chauds.md` |

---

## Tranche 1 · Avant la saison (référentiel et comptes)

| # | Événement | Commande | Acteur | Système | Agrégat | Contexte | UC |
|---|---|---|---|---|---|---|---|
| 1 | Site enregistré | Créer un site | Administrateur | — | `Site` | Référentiel & Accès | UC-AD01 |
| 2 | Coopérative enregistrée | Enregistrer une coopérative | Administrateur | — | `Coopérative` | Référentiel & Accès | UC-AD01 |
| 3 | Ruche référencée | Référencer une ruche | Administrateur / Coordinateur | — | `Ruche` | Référentiel & Accès | UC-AD01 |
| 4 | Capteur appairé | Appairer un capteur à une ruche | Administrateur | — | `Ruche` | Référentiel & Accès | UC-T02 |
| 5 | Position de référence fixée | Définir la position GPS de référence | Coordinateur | — | `Ruche` | Référentiel & Accès | UC-CY04 |
| 6 | Seuils d'alerte configurés | Configurer les seuils par type de ruche et de site | Administrateur | — | `SeuilAlerte` | Collecte & Ingestion | CDC 3.2 |
| 7 | Compte créé | Créer un compte | Administrateur | — | `Compte` | Référentiel & Accès | UC-AD01 |
| 8 | Rôle assigné | Assigner un rôle et un périmètre de sites | Administrateur | — | `Compte` | Référentiel & Accès | UC-AD01 |
| 9 | Compte désactivé | Désactiver un compte | Administrateur | — | `Compte` | Référentiel & Accès | UC-AD01 |
| 10 | Passerelle déployée sur le site | Déployer une passerelle | Administrateur | — | `Passerelle` | Collecte & Ingestion | UC-CY01 |

## Tranche 2 · Collecte continue (UC-T02, UC-CY01→03)

| # | Événement | Cause (commande / système / politique) | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 11 | Mesure reçue | Le capteur émet une trame (30 min ou seuil dépassé) | — | Passerelle LoRaWAN | `Trame` | Collecte & Ingestion |
| 12 | Mesure validée | Politique P1 : quand une mesure est reçue, alors valider la trame | — | Ingestion | `Trame` | Collecte & Ingestion |
| 13 | Trame rejetée | Politique P2 : hors plage physique ou rejeu détecté | — | Ingestion | `Trame` | Collecte & Ingestion |
| 14 | Mesure dédupliquée | Politique P2 : clé `(hive_id, timestamp)` déjà vue | — | Ingestion | `Trame` | Collecte & Ingestion |
| 15 | Alerte d'intégrité levée | Politique P3 : rejets répétés sur la même ruche | — | Ingestion | `Incident` | Supervision et sécurité |
| 16 | Passerelle hors ligne détectée | Absence de heartbeat > 15 min | — | Supervision | `Passerelle` | Collecte & Ingestion |
| 17 | Site passé en mode dégradé | Politique P4 : quand la passerelle est hors ligne, alors mettre en cache local | — | Passerelle | `Passerelle` | Collecte & Ingestion |
| 18 | Passerelle rétablie | Heartbeat reçu à nouveau | — | Supervision | `Passerelle` | Collecte & Ingestion |
| 19 | Mesures resynchronisées | Politique P5 : quand la passerelle est rétablie, alors vider le cache | — | Passerelle | `Passerelle` | Collecte & Ingestion |
| 20 | Capteur silencieux détecté | Aucune trame après 2 cycles de mesure | — | Supervision | `Capteur` | Supervision et sécurité |
| 21 | Brouillage détecté | Taux de trames perdues anormal sur un canal | — | Passerelle | `Passerelle` | Supervision et sécurité |
| 22 | Canal radio changé | Politique P6 : quand un brouillage est détecté, alors changer de canal / SF | — | Passerelle | `Passerelle` | Supervision et sécurité |
| 23 | Déplacement détecté | Position GPS hors tolérance par rapport à la référence | — | Ingestion | `Ruche` | Supervision et sécurité |
| 24 | Transhumance déclarée | Déclarer une transhumance | Apicultrice | — | `Ruche` | Référentiel & Accès |
| 25 | Déplacement non déclaré détecté | Politique P7 : quand un déplacement est détecté sans transhumance déclarée | — | Supervision | `Incident` | Supervision et sécurité |

## Tranche 3 · Détection et cycle de vie de l'alerte (UC-A02, UC-C01)

| # | Événement | Cause | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 26 | Seuil dépassé | Une mesure validée franchit le seuil configuré | — | — | `ColonieSuivie` | Santé des colonies |
| 27 | Score de santé recalculé | Une mesure validée arrive | — | Modèle de prédiction | `ColonieSuivie` | Santé des colonies |
| 28 | Risque détecté | Activité acoustique atypique / chute de poids | — | Modèle de prédiction | `RisquePrédit` | Prévision |
| 29 | Risque d'essaimage détecté | Idem, type = `ESSAIMAGE` | — | Modèle de prédiction | `RisquePrédit` | Prévision |
| 30 | Alerte levée | Politique P8 : quand un risque est détecté, alors lever une alerte | — | — | `Alerte` | Santé des colonies |
| 31 | Apicultrice notifiée | Politique P8 (suite) : push si connectée, sinon au prochain accès | — | Service de notification | `Alerte` | Santé des colonies |
| 32 | Alerte consultée | L'apicultrice ouvre le détail (type, confiance, recommandation) | Apicultrice | — | `Alerte` | Santé des colonies |
| 33 | Alerte prise en charge | Prendre en charge une alerte | Apicultrice | — | `Alerte` | Santé des colonies |
| 34 | Coordinateur notifié de l'escalade | Politique P9 : aucune prise en charge sous 48 h | — | — | `Alerte` | Santé des colonies |
| 35 | Alerte escaladée | Politique P9 : quand 48 h sans prise en charge, alors escalader | — | — | `Alerte` | Santé des colonies |
| 36 | Alerte réaffectée | Assigner une alerte escaladée à une apicultrice | Coordinateur | — | `Alerte` | Santé des colonies |
| 37 | Alerte résolue | Résoudre l'alerte après inspection | Apicultrice | — | `Alerte` | Santé des colonies |

## Tranche 4 · Terrain (UC-A01, UC-C01)

| # | Événement | Cause | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 38 | Ruches classées par risque | Consulter les ruches de son site par criticité | Coordinateur | — | `ColonieSuivie` | Santé des colonies |
| 39 | Visite planifiée | Planifier une visite (criticité + géolocalisation) | Coordinateur | — | `Visite` | Terrain & visites |
| 40 | Visite assignée | Assigner une visite à une apicultrice | Coordinateur | — | `Visite` | Terrain & visites |
| 41 | Inspection enregistrée hors ligne | Enregistrer une inspection | Apicultrice | — | `Inspection` | Terrain & visites |
| 42 | Inspection synchronisée | Politique P10 : quand le réseau revient, alors synchroniser | — | Application mobile | `Inspection` | Terrain & visites |
| 43 | Conflit de synchronisation détecté | Double saisie sur la même ruche / créneau | — | Synchronisation | `Inspection` | Terrain & visites |
| 44 | Anomalie signalée | Signaler une anomalie pendant l'inspection | Apicultrice | — | `Inspection` | Terrain & visites |
| 45 | Coordinateur notifié de l'anomalie | Politique P10 (suite) : inspection synchronisée avec anomalie | — | Service de notification | `Inspection` | Terrain & visites |
| 46 | Visite clôturée | Clôturer la visite | Apicultrice | — | `Visite` | Terrain & visites |

## Tranche 5 · Récolte (UC-A03, UC-C02)

| # | Événement | Cause | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 47 | Récolte déclarée | Déclarer une récolte (ruche, volume, date) | Apicultrice | — | `Récolte` | Production & récoltes |
| 48 | Écart de rendement calculé | Politique P11 : quand une récolte est déclarée, alors comparer à la prédiction | — | Modèle de prédiction | `Récolte` | Production & récoltes |
| 49 | Coopérative et coordinateur notifiés | Politique P11 (suite) : écart > 20 % | — | Service de notification | `Récolte` | Production & récoltes |
| 50 | Récolte validée | Valider la récolte (comparaison aux poids mesurés) | Coordinateur | — | `Récolte` | Production & récoltes |
| 51 | Écart mis en investigation | Signaler un écart | Coordinateur | — | `Récolte` | Production & récoltes |

## Tranche 6 · Impact (UC-G01, UC-G02)

| # | Événement | Cause | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 52 | Indicateurs consolidés | Consolidation multi-sites (rendement, colonies à risque, couverture) | — | — | `IndicateurConsolidé` | Impact & reporting |
| 53 | Période de rapport choisie | Choisir période, sites et indicateurs | Gestionnaire | — | `Rapport` | Impact & reporting |
| 54 | Rapport d'impact généré | Générer un rapport | Gestionnaire | — | `Rapport` | Impact & reporting |
| 55 | Rapport envoyé au bailleur | Envoyer au bailleur | Gestionnaire | Service e-mail | `Rapport` | Impact & reporting |

## Tranche 7 · Accès transverse (UC-T01)

| # | Événement | Cause | Acteur | Système | Agrégat | Contexte |
|---|---|---|---|---|---|---|
| 56 | Authentification réussie | S'authentifier (MFA pour coordinateurs / gestionnaires / admins) | Utilisateur | — | `Compte` | Référentiel & Accès |
| 57 | Authentification échouée | Identifiants incorrects | Utilisateur | — | `Compte` | Référentiel & Accès |
| 58 | Compte bloqué | Politique P12 : 5 échecs consécutifs | — | — | `Compte` | Référentiel & Accès |
| 59 | Session hors ligne ouverte | Politique : jeton à expiration longue, données locales chiffrées | — | Application mobile | `Compte` | Référentiel & Accès |
| 60 | Accès journalisé | Politique : toute action d'administration est tracée | — | Journal | `Journal` | Supervision et sécurité |

---

## Politiques du mur (≥ 4 exigées)

| # | Politique | Contexte | Point chaud lié |
|---|---|---|---|
| P1 | **Quand** une mesure est reçue, **alors** valider la trame (plages physiques, authenticité) | Collecte & Ingestion | #7 |
| P2 | **Quand** une trame est hors plage ou déjà reçue, **alors** la rejeter, la journaliser et dédupliquer sur `(hive_id, timestamp)` | Collecte & Ingestion | #7 |
| P3 | **Quand** des rejets se répètent sur une même ruche, **alors** lever une alerte d'intégrité | Supervision et sécurité | — |
| P4 | **Quand** la passerelle est hors ligne > 15 min, **alors** alerter le site et basculer en mode dégradé | Collecte & Ingestion | #11 |
| P5 | **Quand** la passerelle est rétablie, **alors** resynchroniser intégralement le cache local | Collecte & Ingestion | #11 |
| P6 | **Quand** un brouillage est détecté, **alors** proposer un changement de canal / spreading factor et journaliser | Supervision et sécurité | — |
| P7 | **Quand** un déplacement est détecté sans transhumance déclarée, **alors** alerter le coordinateur et l'administrateur | Supervision et sécurité | #9 |
| P8 | **Quand** un risque est détecté, **alors** lever une alerte et notifier l'apicultrice (push, sinon prochain accès) | Santé des colonies | #6 |
| P9 | **Si** aucune prise en charge sous 48 h, **alors** escalader et notifier le coordinateur | Santé des colonies | #2, #4 |
| P10 | **Quand** une inspection est synchronisée avec anomalie, **alors** notifier le coordinateur | Terrain & visites | #8 |
| P11 | **Quand** une récolte est déclarée, **alors** comparer à la prédiction et notifier si écart > 20 % | Production & récoltes | #1 |
| P12 | **Quand** 5 authentifications échouent, **alors** bloquer le compte et journaliser | Référentiel & Accès | #12 |

---

## Agrégats du mur (12 · 2 invariants chacun)

| Agrégat | Contexte | Invariants |
|---|---|---|
| `Alerte` | Santé des colonies | 1) `type ∈ TYPES_DE_RISQUE` et `confiance ∈ [0 ; 1]` · 2) une alerte RÉSOLUE n'accepte plus aucune transition · 3) escalade seulement si 48 h sans prise en charge |
| `ColonieSuivie` | Santé des colonies | 1) le score ne dépend que de mesures **validées** · 2) pas de score sur une fenêtre vide |
| `RisquePrédit` | Prévision | 1) toujours accompagné d'une confiance dans [0 ; 1] · 2) rattaché à une version de modèle |
| `PredictionRendement` | Prévision | 1) immuable une fois publiée · 2) versionnée par saison |
| `Trame` / `Mesure` | Collecte & Ingestion | 1) valeurs dans les plages physiques · 2) `(hive_id, timestamp)` unique |
| `Passerelle` | Collecte & Ingestion | 1) mode dégradé seulement si heartbeat perdu · 2) cache non purgé avant resynchronisation |
| `Visite` | Terrain & visites | 1) assignable seulement à une apicultrice du site · 2) une visite clôturée ne se réassigne pas |
| `Inspection` | Terrain & visites | 1) ruche connue du référentiel · 2) une fois synchronisée, plus de modification locale |
| `Récolte` | Production & récoltes | 1) volume > 0 et une récolte validée ne change plus · 2) un écart signalé exige un commentaire |
| `Rapport` | Impact & reporting | 1) un rapport envoyé est figé · 2) il couvre une période et au moins un site |
| `Ruche` | Référentiel & Accès | 1) une seule position de référence · 2) une ruche appartient à un seul site |
| `Compte` | Référentiel & Accès | 1) un seul rôle parmi les 4 · 2) blocage après 5 échecs, un compte désactivé n'ouvre plus de session |

---

## Zone « Écartés » (faits techniques / interface, barrés sur le mur)

`Données insérées dans harvests` · `Bouton Valider cliqué` · `Trame binaire décodée` · `Ligne insérée en base` · `Message MQTT publié` · `Webhook reçu` · `Cache local écrit` · `PDF téléchargé` · `Notification affichée` · `Index créé en base`

## Événements pivots (⭐ sur le mur)

⭐ `Passerelle hors ligne détectée` (bascule en mode dégradé) · ⭐ `Alerte levée` (entrée dans le cycle de vie terrain) · ⭐ `Alerte escaladée` (passage à l'exploitation) · ⭐ `Inspection synchronisée` (le terrain rejoint le central) · ⭐ `Récolte validée` (entrée dans le reporting).
