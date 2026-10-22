# Diagnostic — `seance3-solid/tp3/ReportService.js`

| # | Principe | Ligne(s) | Problème | Conséquence concrète |
|---|----------|----------|----------|----------------------|
| 1 | S | 25–88 | `generate()` fait tout : elle lit le fichier, calcule le CA, met en forme, écrit le log et envoie le mail. | Cinq personnes différentes ont une raison de la modifier (marketing pour un format, finance pour la TVA, ops pour le log/SMTP, produit pour l'offre gratuite).  |
| 2 | D | 7–18 | Le constructeur fabrique ses dépendances lui-même : chemin en dur vers `orders.json` (l. 9) et config SMTP écrite en clair dans le code (l. 10–15). | Impossible de tester le calcul sans le vrai fichier `orders.json` sur le disque, ni de tester l'envoi sans aller lire `service.outbox` à la main. Et le jour où les commandes viennent d'une base, c'est la classe métier qu'il faut modifier. |
| 3 | O | 48–70 | Un `if` / `else if` par format, et un `throw` pour tout le reste. | Pour ajouter le PDF, il faut **modifier** `generate()` au lieu d'ajouter un fichier : on rouvre une méthode qui marche pour toucher du code déjà testé, avec le risque de casser CSV ou HTML. Le format supporté est décidé une fois pour toutes dans le code. |
| 4 | L | 92–98 | `FreeReportService` refuse (`throw`) ce que `ReportService` accepte : les formats html/json et tout destinataire. | Si on passe un `FreeReportService` à du code écrit pour `ReportService` (par exemple `generate(mois, 'html', 'x@y.fr')`), ça plante sans prévenir. Du coup il faut tester `instanceof` avant chaque appel, et les tests du parent ne sont pas réutilisables. |
| 5 | Autre | 14 | Le mot de passe SMTP est écrit en clair dans le code source. | Il est dans l'historique Git pour toujours, même après suppression : toute personne qui a cloné le dépôt peut envoyer des mails en tant que `reports@shoplite.fr`. Le changer oblige à modifier le code et à redéployer. |


