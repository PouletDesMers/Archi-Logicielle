# Architecture Logicielle – exemples exécutables (M1 Tronc Commun · INGETIS)

Prérequis : Node.js 20 ou plus récent (version LTS recommandée). Aucune dépendance à installer.

```bash
node -v                # vérifier la version (v20 ou plus)
npm test               # lance les 23 tests des exemples
npm run demo           # exécute toutes les démonstrations console
npm run s4             # uniquement la séance 4 (s2 à s5)
npm run serve          # exemples navigateur (séance 1) : http://localhost:5173
npm run hexa:server    # API HTTP de l'exemple hexagonal : http://localhost:3000
npm run lint:archi     # vérifie la règle de dépendance du domaine
npm run tp4            # kit TP 4 · parcours Data / Cyber
npm run tp5            # kit TP 5 · agrégat Alerte QueenBee (parcours Dev)
```

| Dossier | Séance |
|---|---|
| `seance1-presentation/` | S1 · MVC, MVP, MVVM |
| `seance2-architecture/` | S2 · Clean, hexagonale, ADR |
| `seance3-solid/` | S3 · SOLID, injection de dépendances |
| `seance4-patterns/` | S4 · patterns créationnels et structuraux + kit TP 4 Data / Cyber |
| `seance5-comportement-ddd/` | S5 · patterns comportementaux, DDD + kit QueenBee « Alerte » |
| `seance6-documentation/` | S6 · C4, UML, ADR de spécialité, analyse de menaces |

Voir le guide pratique (Word / PDF) pour les explications détaillées.
