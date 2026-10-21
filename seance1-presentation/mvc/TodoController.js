// CONTROLLER : traduit les actions de la vue en opérations sur le modèle.
export class TodoController {
  constructor(model, view) {
    view.bindAdd(title => {
      try {
        model.add(title);
        view.showError('');
      } catch (e) {
        view.showError(e.message);
      }
    });
    view.bindToggle(id => model.toggle(id));
    view.bindRemove(id => model.remove(id));
    model.subscribe(todos => view.render(todos)); // la vue observe le modèle
  }
}
