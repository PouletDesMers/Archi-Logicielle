# Points chauds · groupe Dev-1

| # | Question | Impact si on se trompe | Qui peut répondre | Devient un ADR ? |
|---|---|---|---|---|
| 1 | **Seuil d'écart de rendement** : 20 % est-il un paramètre global, par coopérative ou par site ? | Alertes inutiles (bruit) ou écarts réels ignorés | Coordinateurs BeeAfrica | **oui** — « Où et comment paramétrer les seuils métier ? » |
| 2 | **Délai d'escalade de 48 h** : fixé par qui, modifiable par site ? Décompté en heures ouvrées ? | Escalades la nuit / le week-end, ou alertes jamais escaladées | BeeAfrica (gestionnaires) | non (paramètre) mais à documenter |
| 3 | **« Alerte » a deux sens** (colonie vs infrastructure) : on garde deux contextes ou un seul avec un champ `categorie` ? | Un agrégat fourre-tout, deux cycles de vie incompatibles | Équipe (Dev + Cyber) | **oui** — « Un agrégat Alerte pour la colonie et l'infrastructure ? » |
| 4 | **Où vit la politique d'escalade à 48 h** : tâche planifiée, file différée avec report, ou calcul à la lecture ? | Escalade en retard, ou doublons d'événements `AlerteEscaladée` | Équipe Dev + DevOps | **oui** — ADR de spécialité Dev |
| 5 | **Priorité de résolution** : une alerte ESCALADÉE peut-elle être résolue sans prise en charge préalable ? | Contournement du workflow par le coordinateur, ou blocage terrain | Coordinateurs régionaux | **oui** (règle de transition) |
| 6 | **Confiance minimale** pour lever une alerte : 0,5 ? dépend-elle du type de risque (mortalité plus sensible que stress thermique) ? | Trop de fausses alertes ou des mortalités manquées | Data + BeeAfrica | **oui** |
| 7 | **Mesure validée : lots ou flux ?** 38 400 mesures/jour, alertes attendues en minutes | Latence des alertes, coût d'infrastructure | Data + Dev | **oui** — amorce d'ADR Data |
| 8 | **Mode hors ligne** : jusqu'où l'application terrain peut-elle agir sans réseau (créer une alerte ? clôturer une visite ?) | Conflits de synchronisation, états incohérents | BeeAfrica (terrain) | **oui** — ADR de spécialité Dev |
| 9 | **Transhumance** : qui déclare le déplacement (apicultrice ou coordinateur) et avec quel préavis ? | Vols non détectés ou alertes de vol injustifiées | Coordinateurs + Cyber | non (règle métier à préciser) |
| 10 | **Rétention des données** : combien de temps garde-t-on les mesures brutes et les photos d'inspection (bailleurs, données personnelles) ? | Non-conformité, coût de stockage | BeeAfrica + Cyber | **oui** |
| 11 | **Seuil de silence d'un capteur** : 2 cycles (30 min) ou plus, sachant que la passerelle peut être en différé plusieurs heures ? | Fausses alertes techniques massives après une coupure réseau | Cyber + Dev | non (paramètre) |
| 12 | **Un compte = un site ou plusieurs sites ?** Les coordinateurs couvrent-ils plusieurs sites ? | Modèle de permissions faux, fuite de données inter-sites | BeeAfrica (admin) | **oui** |

## Points chauds qui deviennent des ADR (séance 6)

| ADR prévu | Point chaud d'origine | Sujet |
|---|---|---|
| ADR-0001 | #4 | Emplacement de la politique d'escalade à 48 h |
| ADR-0002 | #8 | Périmètre des actions autorisées hors ligne |
| ADR-0003 | #3 | Découpage alerte colonie / alerte infrastructure |
| ADR-0004 | #7 | Ingestion des mesures : lots ou flux |
| ADR-0005 | #10 | Rétention et conformité des données |
