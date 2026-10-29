# Séquence : Synchronisation d'une inspection hors ligne (UC-A01)

Ce diagramme illustre le flux de réconciliation des données saisies localement sur l'App Mobile Terrain vers l'API Centrale, incluant la résolution des conflits de concurrence optimiste.

```mermaid
sequenceDiagram
    autonumber
    actor A as Apicultrice
    participant App as App Mobile Terrain
    participant API as API Centrale
    participant DB as Base de Données Centrale
    participant Broker as Message Broker

    A->>App: Valider le rapport d'inspection locale
    App->>App: Stockage local SQLite (status: PENDING_SYNC)
    
    Note over App,API: Connexion réseau rétablie (4G/Wi-Fi)
    
    App->>API: POST /api/v1/inspections/sync (Payload + versionToken)
    API->>DB: SELECT version, updated_at FROM ruches WHERE id = :id
    DB-->>API: RucheEntity (version courante)

    alt Version identique (Pas de conflit de concurrence)
        API->>DB: BEGIN TRANSACTION
        API->>DB: INSERT INTO inspections (...)
        API->>DB: UPDATE ruches SET version = version + 1, statut = :nouveauStatut
        API->>DB: COMMIT
        DB-->>API: Transaction OK
        API->>Broker: PUBLISH ruche:inspected (event JSON)
        API-->>App: 200 OK { syncStatus: "SUCCESS", newVersion: N+1 }
        App->>App: Marquer inspection comme synchronisée (SQLite)
        App-->>A: Notification : Relevé synchronisé avec succès
    else Conflit détecté (409 Conflict - Version distante plus récente)
        API-->>App: 409 Conflict { serverState: {...}, conflictReason: "VERSION_MISMATCH" }
        App->>App: Conserver les données locales et marquer en conflit
        App-->>A: Affichage écran de réconciliation (choix manuel des deltas)
    end