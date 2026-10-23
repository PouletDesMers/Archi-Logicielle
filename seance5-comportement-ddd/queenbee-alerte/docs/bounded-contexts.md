# Bounded contexts QueenBee · groupe Dev-1

> 8 contextes. La frontière est toujours justifiée par un **changement de sens du vocabulaire**
> (voir `glossaire.md`, section « Mots à plusieurs sens »).

## Collecte & Ingestion
- **Responsabilité (une phrase)** : Recevoir les trames des passerelles, les valider, les dédupliquer et publier des mesures fiables.
- **Type** : support · **Spécialité la plus concernée** : Data (+ Cyber pour l'intégrité)
- **Agrégats** : `Trame` / `Mesure` (invariants : plages physiques respectées ; `(hive_id, timestamp)` unique), `Passerelle` (invariants : mode dégradé seulement si heartbeat perdu ; cache non purgé avant resynchronisation)
- **Événements publiés** : `MesureReçue`, `MesureValidée`, `TrameRejetée`, `MesureDédupliquée`, `AlerteIntégritéLevée`, `PasserelleHorsLigneDétectée`, `PasserelleRétablie`, `MesuresResynchronisées`
- **Événements consommés** : aucun (point d'entrée du système)
- **Cas d'utilisation sources** : UC-T02, UC-CY01, UC-CY02
- **Mots propres à ce contexte** : trame, mesure, mesure validée, seuil, heartbeat, mode dégradé

## Santé des colonies
- **Responsabilité (une phrase)** : Décider quand une colonie est en risque, lever l'alerte correspondante et la suivre jusqu'à sa résolution.
- **Type** : cœur · **Spécialité la plus concernée** : Dev
- **Agrégats** : `Alerte` (invariants : type ∈ `TYPES_DE_RISQUE` ; confiance ∈ [0 ; 1] ; résolution uniquement après prise en charge et avec un identifiant d'inspection ; escalade seulement après 48 h sans prise en charge ; une alerte résolue n'accepte plus aucune transition), `ColonieSuivie` (invariants : score calculé uniquement sur des mesures validées ; pas de score sur une fenêtre vide)
- **Événements publiés** : `SeuilDépassé`, `ScoreDeSantéRecalculé`, `AlerteLevée`, `AlertePriseEnCharge`, `AlerteEscaladée`, `AlerteRésolue`
- **Événements consommés** : `MesureValidée` (Collecte), `RisqueDétecté` (Prévision), `InspectionSynchronisée` (Terrain)
- **Cas d'utilisation sources** : UC-A02, UC-C01
- **Mots propres à ce contexte** : alerte (de colonie), type de risque, confiance, score de santé, prise en charge, escalade, résolution

## Prévision
- **Responsabilité (une phrase)** : Calculer le risque et le rendement attendus d'une colonie à partir des mesures et du contexte météo.
- **Type** : cœur · **Spécialité la plus concernée** : Data
- **Agrégats** : `PredictionRendement` (invariants : immuable une fois publiée ; versionnée par saison), `RisquePrédit` (invariants : toujours accompagné d'un niveau de confiance dans [0 ; 1])
- **Événements publiés** : `RisqueDétecté`, `PrédictionRendementCalculée`
- **Événements consommés** : `MesureValidée` (Collecte), données `OpenWeatherMap` (système externe)
- **Cas d'utilisation sources** : UC-A02, UC-A03
- **Mots propres à ce contexte** : prédiction, confiance, saison, modèle, features acoustiques

## Terrain & visites
- **Responsabilité (une phrase)** : Organiser le travail des apicultrices sur le terrain — planifier, assigner, exécuter et synchroniser les visites et inspections.
- **Type** : cœur · **Spécialité la plus concernée** : Dev
- **Agrégats** : `Visite` (invariants : assignable seulement à une apicultrice du site ; une visite clôturée ne se réassigne plus), `Inspection` (invariants : ruche connue du référentiel ; une inspection synchronisée n'est plus modifiable localement)
- **Événements publiés** : `VisitePlanifiée`, `VisiteAssignée`, `InspectionEnregistréeHorsLigne`, `InspectionSynchronisée`, `ConflitDeSynchronisationDétecté`, `AnomalieSignalée`, `VisiteClôturée`
- **Événements consommés** : `AlerteLevée` (Santé), `RucheRéférencée` / `SiteEnregistré` (Référentiel)
- **Cas d'utilisation sources** : UC-A01, UC-C01
- **Mots propres à ce contexte** : visite, inspection, tournée, hors ligne, synchronisation, anomalie

## Production & récoltes
- **Responsabilité (une phrase)** : Enregistrer les récoltes déclarées, les confronter à la prédiction et faire trancher le coordinateur.
- **Type** : cœur · **Spécialité la plus concernée** : Dev (+ Data pour l'écart)
- **Agrégats** : `Récolte` (invariants : volume > 0 ; une récolte validée ne change plus ; un écart signalé exige un commentaire)
- **Événements publiés** : `RécolteDéclarée`, `ÉcartDeRendementCalculé`, `RécolteValidée`, `ÉcartMisEnInvestigation`
- **Événements consommés** : `PrédictionRendementCalculée` (Prévision), `InspectionSynchronisée` (Terrain)
- **Cas d'utilisation sources** : UC-A03, UC-C02
- **Mots propres à ce contexte** : récolte, écart de rendement, validation (métier), investigation

## Impact & reporting
- **Responsabilité (une phrase)** : Consolider les indicateurs multi-sites et produire les rapports d'impact pour les bailleurs.
- **Type** : support · **Spécialité la plus concernée** : Data
- **Agrégats** : `Rapport` (invariants : un rapport envoyé est figé ; il couvre une période et au moins un site), `IndicateurConsolidé` (invariants : toujours rattaché à une période et à un périmètre de sites)
- **Événements publiés** : `IndicateursConsolidés`, `PériodeDeRapportChoisie`, `RapportGénéré`, `RapportEnvoyéAuBailleur`
- **Événements consommés** : `MesureValidée` (Collecte), `RécolteValidée` (Production), `AlerteRésolue` (Santé)
- **Cas d'utilisation sources** : UC-G01, UC-G02
- **Mots propres à ce contexte** : indicateur, période, rapport, bailleur, rendement consolidé

## Référentiel & Accès
- **Responsabilité (une phrase)** : Tenir la vérité sur les sites, coopératives, ruches et comptes, et contrôler qui peut agir où.
- **Type** : générique · **Spécialité la plus concernée** : Dev (+ Cyber pour les accès)
- **Agrégats** : `Ruche` (invariants : une position de référence unique ; une ruche appartient à un seul site), `Compte` (invariants : un seul rôle parmi les 4 ; un compte désactivé n'ouvre plus de session ; blocage après 5 échecs)
- **Événements publiés** : `SiteEnregistré`, `CoopérativeEnregistrée`, `RucheRéférencée`, `CapteurAppairé`, `CompteCréé`, `RôleAssigné`, `CompteDésactivé`, `AuthentificationRéussie`, `AuthentificationÉchouée`, `CompteBloqué`, `TranshumanceDéclarée`
- **Événements consommés** : aucun
- **Cas d'utilisation sources** : UC-AD01, UC-T01, UC-CY04 (transhumance)
- **Mots propres à ce contexte** : site, coopérative, ruche (référentiel), compte, rôle, permission, transhumance

## Supervision et sécurité
- **Responsabilité (une phrase)** : Surveiller l'infrastructure et détecter les incidents techniques (site isolé, intégrité, brouillage, déplacement).
- **Type** : support · **Spécialité la plus concernée** : Cyber
- **Agrégats** : `Incident` (invariants : une cause typée obligatoire à l'ouverture ; clôture seulement avec un journal de résolution), `ZoneDeConfiance` (invariants : un contexte appartient à une seule zone ; tout passage de zone est authentifié et journalisé)
- **Événements publiés** : `PasserelleHorsLigneDétectée`, `CapteurSilencieuxDétecté`, `BrouillageDétecté`, `DéplacementNonDéclaréDétecté`, `IncidentClos`, `AccèsJournalisé`
- **Événements consommés** : `AlerteEscaladée` (Santé), `AlerteIntégritéLevée` (Collecte), `AuthentificationÉchouée` (Référentiel)
- **Cas d'utilisation sources** : UC-CY01, UC-CY02, UC-CY03, UC-CY04
- **Mots propres à ce contexte** : incident, heartbeat, brouillage, rejeu, zone de confiance, journal

## Frontières tracées (justification courte)

| Frontière | Mot qui change de sens | Décision |
|---|---|---|
| Santé ⇄ Supervision | « Alerte » | Deux cycles de vie distincts → deux agrégats, deux contextes |
| Collecte ⇄ Production | « Validation » | Validation technique (trame) ≠ validation métier (récolte) |
| Référentiel ⇄ Santé | « Ruche » | Équipement (référentiel) ≠ colonie suivie (santé) |
| Collecte ⇄ Terrain | « Mesure » vs « Inspection » | Ce qui est mesuré par un capteur ≠ ce qu'observe une apicultrice |
| Prévision ⇄ Production | « Rendement » | Rendement attendu (modèle) ≠ rendement déclaré (terrain) |
