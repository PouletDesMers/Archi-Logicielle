# Décision évaluée : ADR 0002 - Stratégie de gestion des conflits hors ligne

## Scénarios de qualité
- **S1 (Disponibilité / UX terrain) :** En coupure réseau complète durant 8h, l'apicultrice doit pouvoir saisir 100% de ses inspections sans blocage ni latence perceptible (< 100 ms).
- **S2 (Intégrité des données sanitaires) :** En cas de synchronisations concurrentes sur la même ruche, aucune donnée critique (maladie déclarée, traitement appliqué) ne doit être écrasée silencieusement.
- **S3 (Simplicité de mise en œuvre et d'exploitation) :** L'architecture doit pouvoir être testée et déployée dans les délais impartis par l'équipe de dev sans nécessiter un cluster distribué complexe.

## Matrice de décision
| Scénario (poids) | Option A : Verrouillage pessimiste | Option B : Optimiste + Résolution assistée | Option C : Modèle CRDT complet |
| :--- | :---: | :---: | :---: |
| **S1 (40%)** | 1 / 5 | 5 / 5 | 5 / 5 |
| **S2 (40%)** | 4 / 5 | 4 / 5 | 3 / 5 |
| **S3 (20%)** | 3 / 5 | 4 / 5 | 1 / 5 |
| **Score pondéré / 5** | **2.6 / 5** | **4.4 / 5** | **3.4 / 5** |

### Détail des calculs
- **Option A :** $(1 \times 0.4) + (4 \times 0.4) + (3 \times 0.2) = 0.4 + 1.6 + 0.6 = 2.6$
- **Option B :** $(5 \times 0.4) + (4 \times 0.4) + (4 \times 0.2) = 2.0 + 1.6 + 0.8 = \mathbf{4.4}$
- **Option C :** $(5 \times 0.4) + (3 \times 0.4) + (1 \times 0.2) = 2.0 + 1.2 + 0.2 = 3.4$

## Justification des notes
- **Option A :** Inutilisable si la coupure intervient sans réservation préalable (Note S1: 1) ; évite les conflits mais bloque le travail d'équipe (Note S2: 4) ; simple à implémenter mais gestion complexe des timeouts de lock (Note S3: 3).
- **Option B :** Expérience utilisateur fluide en déconnecté (Note S1: 5) ; intégrité garantie par le code 409 et l'intervention humaine ciblée (Note S2: 4) ; intégration standard REST/JSON bien maîtrisée sous Fastify (Note S3: 4).
- **Option C :** Disponibilité hors ligne maximale (Note S1: 5) ; difficile de faire respecter des règles d'invariants sanitaires complexes via simple fusion automatique (Note S2: 3) ; courbe d'apprentissage et coût d'implémentation très lourds (Note S3: 1).

## Analyse de sensibilité
Pour que l'**Option C (CRDT)** devienne gagnante face à l'Option B, il faudrait que le poids de **S3 (Simplicité)** chute à 0% et que le critère S1 atteigne au moins 85% du poids global. Ce scénario n'est **pas plausible** pour le projet BeeAfrica, dont l'équipe de développement restreinte doit livrer une solution industrielle maintenable et respecter strictement les contraintes de gouvernance sanitaire.

## Conclusion
L'**Option B** s'impose comme le choix optimal et pragmatique. Ce résultat est consigné dans l'ADR 0002.
