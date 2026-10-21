# QueenBee · diagrammes UML de l'alerte (Mermaid)

S'affiche dans VS Code (extension « Markdown Preview Mermaid Support »), sur GitHub/GitLab ou sur https://mermaid.live

## Séquence : de la mesure à l'alerte

```mermaid
sequenceDiagram
  participant P as Passerelle
  participant B as Broker MQTT
  participant I as Ingestion
  participant S as Santé colonies
  actor A as Apicultrice
  P->>B: mesures (hive_id, poids…)
  B->>I: trame
  I->>I: valider plages + rejeu
  I-->>S: MesureValidée
  S->>S: score de santé
  S-->>A: AlerteLevée (push différé)
```

## États : cycle de vie d'une alerte (agrégat Alerte, kit du TP 5)

```mermaid
stateDiagram-v2
  [*] --> Levée
  Levée --> PriseEnCharge : visite assignée
  Levée --> Escaladée : sans réponse 48h
  Escaladée --> PriseEnCharge
  PriseEnCharge --> Résolue : inspection
  Résolue --> [*]
```
