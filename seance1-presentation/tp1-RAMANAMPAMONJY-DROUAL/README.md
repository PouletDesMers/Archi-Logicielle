# Comparaison MVC / MVVM

En MVC, le contrôleur mémorise le filtre courant et demande au modèle les tâches filtrées.
Le modèle contient `filtrer(nom)` et `restantes()` ; la vue affiche les données reçues.
En MVVM, cette logique se trouve dans le ViewModel, avec les valeurs observables `filtre` et `visibles`.

Sans navigateur, nous avons testé le modèle MVC, notamment le filtrage et le compteur des tâches restantes.
En MVVM, les tests du modèle et les cinq tests de `TodoViewModel` peuvent aussi être exécutés seuls.
L'ajout du filtre en MVC a modifié quatre fichiers : `TodoModel.js`, `TodoController.js`, `TodoView.js` et `index.html`.

Pour un tableau de bord QueenBee en temps réel, je choisirais MVVM : ses valeurs observables déclenchent les mises à jour.
Le ViewModel centralise l'état de présentation tout en gardant la vue découplée de la logique métier.
