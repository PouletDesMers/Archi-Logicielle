// Le modèle se teste sans navigateur : il ne dépend pas du DOM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TodoModel } from './TodoModel.js';

test('ajouter une tâche notifie les abonnés', () => {
  const model = new TodoModel();
  const snapshots = [];
  model.subscribe(todos => snapshots.push(todos));
  model.add('Lire le cours');
  assert.equal(snapshots.length, 2); // état initial + après ajout
  assert.equal(snapshots[1][0].title, 'Lire le cours');
});

test('un titre vide est refusé', () => {
  assert.throws(() => new TodoModel().add('   '), /obligatoire/);
});

test('toggle inverse l’état done', () => {
  const model = new TodoModel();
  model.add('A');
  const [a] = model.all();
  model.toggle(a.id);
  assert.equal(model.all()[0].done, true);
});
