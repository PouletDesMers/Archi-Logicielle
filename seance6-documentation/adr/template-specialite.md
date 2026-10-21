# ADR-00X : <titre de la décision de spécialité>

- Date : AAAA-MM-JJ
- Statut : Proposé | Accepté
- Binôme : <noms> · Spécialité : Dev | Data | Cyber
- Diagramme C4 concerné : <niveau et vue, ex. « niveau 2 · conteneurs QueenBee »>

## Contexte
<Le problème, tiré du cahier des charges QueenBee : citer la section ou le cas d'utilisation
(ex. UC-T02, 6.4 volumétrie, 8.2 sécurité). Quelles contraintes ? connectivité intermittente,
volumétrie, bénéficiaires vulnérables, 8 sites…>

## Options étudiées (au moins deux)
| Option | Avantages | Inconvénients |
|---|---|---|
| A · … | … | … |
| B · … | … | … |

## Décision
<L'option retenue, formulée à l'affirmative, et le critère qui a fait la différence.>

## Conséquences
- (+) …
- (−) …
- Ce qu'il faudra surveiller ou revoir : …

## Pistes de sujet par spécialité
- **Dev** : découpage des bounded contexts, ou communication REST / événementielle (MQTT, file de messages) entre contextes
- **Data** : ingestion batch ou streaming des mesures, et contrat de données entre Télémétrie et Santé des colonies
- **Cyber** : zones de confiance et authentification (passerelles, utilisateurs, jetons hors ligne), avec l'analyse de menaces jointe
