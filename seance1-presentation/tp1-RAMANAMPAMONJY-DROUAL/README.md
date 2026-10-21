# Comparaison MVC / MVVM

1. En MVC, le contrôleur mémorise le filtre courant et demande au modèle les tâches filtrées.
2. Le modèle MVC contient `filtrer(nom)` et `restantes()` ; la vue ne fait qu'afficher.
3. En MVVM, le ViewModel porte cette logique via les valeurs observables `filtre` et `visibles`.
4. En MVC, les tests de `TodoModel` vérifient le filtrage et le nombre de tâches restantes.
5. En MVVM, les tests du modèle et les cinq tests de `TodoViewModel` s'exécutent sans navigateur.
6. L'ajout du filtre en MVC a modifié quatre fichiers.
7. Ce sont `TodoModel.js`, `TodoController.js`, `TodoView.js` et `index.html`.
8. Pour un tableau de bord QueenBee en temps réel, je choisirais MVVM.
9. Ses valeurs observables déclenchent naturellement les mises à jour de l'interface.
10. Le ViewModel centralise l'état de présentation tout en gardant la vue découplée du métier.
