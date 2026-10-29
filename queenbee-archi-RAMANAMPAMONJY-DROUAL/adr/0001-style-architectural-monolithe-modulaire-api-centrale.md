# ADR 0001 : Adoption d'un monolithe modulaire pour le déploiement de l'API Centrale

- **Statut :** Accepté
- **Date :** 2026-10-23
- **Auteurs :** Clément Droual & RAMANAMPAMONJY Riantsoa Lahatriniaina
- **Spécialité :** Dev
- **Élément du C4 :** Conteneur *API Centrale [Node.js 22 / Fastify]*

## Contexte
Le système QueenBee doit intégrer l'ensemble des règles métier transactionnelles réparties sur plusieurs Bounded Contexts (Santé & Ruches, Planification, Inspections, IAM). Face à une équipe de développement de taille réduite et à la nécessité de garantir l'intégrité transactionnelle tout en évitant le surcoût opérationnel d'un cluster microservices distribué, une décision structurante sur le style de déploiement central s'impose.

## Options considérées
1. **Option A : Architecture microservices complète.** Chaque Bounded Context est déployé comme un service indépendant avec son propre cycle de vie et sa base de données dédiée.
   - *Avantages :* Découplage strict des équipes et scalabilité granulaire.
   - *Inconvénients :* Complexité opérationnelle critique, gestion de transactions distribuées (Saga), latence réseau inter-services excessive.
2. **Option B : Monolithe modulaire avec séparation stricte des domaines (Retenue).** L'API s'exécute dans un conteneur unique, mais le code applicatif est partitionné en modules isolés sans accès croisé direct aux tables des autres modules.
   - *Avantages :* Simplicité de déploiement, transactions ACID locales, refactorisation aisée, latence minimale en mémoire.
   - *Inconvénients :* Dépendance d'un cycle de release unique pour l'API centrale.
3. **Option C : Monolithe non structuré (Layered MVC traditionnel).**
   - *Avantages :* Vitesse de développement initiale très rapide.
   - *Inconvénients :* Dette technique massive, couplage fort entre modèles de données, dérive rapide vers le plat de spaghettis.

## Décision
Adoption de l'**Option B (Monolithe modulaire)**. L'isolation logique est matérialisée dans le code par des adaptateurs et des interfaces explicites, tout en mutualisant le socle d'exécution Node.js Fastify et l'instance PostgreSQL 16.

## Conséquences
- **Positives :** Déploiement et supervision centralisés simples ; intégrité transactionnelle garantie sans coordination réseau externe.
- **Négatives :** Discipline rigoureuse requise pour bannir les imports croisés entre modules sans passer par les ports/adaptateurs.
- **À surveiller :** Temps de démarrage du conteneur et taux de couplage inter-modules via analyse statique CI/CD.

## Révision
Rouvrir la décision si l'équipe technique dépasse 20 développeurs ou si un sous-domaine spécifique nécessite une scalabilité horizontale 10 fois supérieure au reste de la plateforme.
