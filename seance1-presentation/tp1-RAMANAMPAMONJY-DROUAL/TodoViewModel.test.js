import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TodoViewModel } from './TodoViewModel.js';

test('ajouter une tâche met à jour la liste et le compteur', () => {
  const vm = new TodoViewModel();
  vm.ajouter('Lire le cours');
  assert.equal(vm.visibles.get().length, 1);
  assert.equal(vm.restantes.get(), 1);
});

test('un titre vide remplit erreur et n’ajoute rien', () => {
  const vm = new TodoViewModel();
  vm.ajouter('   ');
  assert.equal(vm.erreur.get(), 'Le titre est obligatoire');
  assert.equal(vm.visibles.get().length, 0);
});

test('le filtre « faites » ne garde que les tâches cochées', () => {
  const vm = new TodoViewModel();
  vm.ajouter('Lire le cours');
  vm.ajouter('Faire les exercices');
  vm.basculer(vm.visibles.get()[0].id);
  vm.changerFiltre('faites');
  assert.deepEqual(vm.visibles.get().map(todo => todo.title), ['Lire le cours']);
});

test('basculer une tâche fait baisser le nombre de tâches restantes', () => {
  const vm = new TodoViewModel();
  vm.ajouter('Lire le cours');
  const [todo] = vm.visibles.get();
  vm.basculer(todo.id);
  assert.equal(vm.restantes.get(), 0);
});

test('un filtre inconnu remplit erreur', () => {
  const vm = new TodoViewModel();
  vm.changerFiltre('inconnues');
  assert.equal(vm.erreur.get(), 'Filtre inconnu : inconnues');
});
