# Version MVVM

Dans la version MVC, le contrôleur conservait le filtre courant et demandait au
modèle les tâches filtrées avant de les transmettre à la vue. Dans la version
MVVM, cette logique se trouve dans `TodoViewModel`, qui expose `visibles` et
`filtre` comme valeurs observables.

Les tests du modèle et les cinq tests du ViewModel peuvent être exécutés sans
navigateur. En MVC, le filtre a nécessité de modifier le modèle, le contrôleur,
la vue et la page HTML. En MVVM, la page HTML ne contient plus que des liaisons
et des appels de commandes ; le ViewModel peut donc être testé isolément.

Pour un tableau de bord QueenBee affichant des mesures en temps réel, je
choisirais MVVM : les valeurs observables rendent les mises à jour réactives et
centralisent l'état de présentation, tandis que l'interface reste découplée de
la logique métier.

Pour ajouter « Supprimer les tâches faites », il faudrait modifier le modèle,
le ViewModel et la liaison du bouton dans `index.html`, soit trois fichiers.
