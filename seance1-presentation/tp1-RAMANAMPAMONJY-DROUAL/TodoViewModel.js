// VIEWMODEL : état de présentation observable + commandes. Aucune référence au DOM.
import { observable } from './observable.js';
import { TodoModel } from './TodoModel.js';

export class TodoViewModel {
  visibles = observable([]);
  restantes = observable(0);
  filtre = observable('toutes');
  erreur = observable('');

  constructor(model = new TodoModel()) {
    this.model = model;
    this.model.subscribe(() => this.#recalculer());
  }

  ajouter(titre) {
    try {
      this.model.add(titre);
      this.erreur.set('');
    } catch (error) {
      this.erreur.set(error.message);
    }
  }

  basculer(id) {
    this.model.toggle(id);
  }

  supprimer(id) {
    this.model.remove(id);
  }

  changerFiltre(nom) {
    if (!['toutes', 'faites', 'a-faire'].includes(nom)) {
      this.erreur.set(`Filtre inconnu : ${nom}`);
      return;
    }
    this.filtre.set(nom);
    this.erreur.set('');
    this.#recalculer();
  }

  #recalculer() {
    this.visibles.set(this.model.filtrer(this.filtre.get()));
    this.restantes.set(this.model.restantes());
  }
}
