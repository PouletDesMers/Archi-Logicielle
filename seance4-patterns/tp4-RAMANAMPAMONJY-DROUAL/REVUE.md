# Revue croisée

1. L'ajout de Slack respecte l'OCP : `channels.js` reste inchangé et le canal
   s'enregistre depuis `slack.js` à l'import, sans modifier la fabrique existante.
2. Les décorateurs exposent tous `getQuote(parcel)` et restent composables. Le cache
   est placé autour du retry afin de ne mémoriser qu'un devis finalement réussi ; une
   panne est donc retentée au prochain appel au lieu d'être servie comme un résultat
   cache.
