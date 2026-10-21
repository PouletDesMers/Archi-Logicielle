// Singleton « idiomatique » en JavaScript : un module ES n'est évalué qu'UNE fois.
// Tous les fichiers qui l'importent partagent donc la même instance.
const entries = [];
export const logger = Object.freeze({
  log(source, msg) {
    entries.push(`${source}: ${msg}`);
  },
  history() {
    return [...entries];
  },
});
