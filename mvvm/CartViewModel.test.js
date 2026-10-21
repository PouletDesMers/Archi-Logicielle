import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CartViewModel } from './CartViewModel.js';

test('le total et le nombre d’articles se mettent à jour', () => {
  const vm = new CartViewModel();
  vm.addItem({ name: 'Livre', price: 25 });
  vm.addItem({ name: 'Souris', price: 19 });
  assert.equal(vm.total.get(), 44);
  assert.equal(vm.count.get(), 2);
});

test('les abonnés (la vue) sont notifiés', () => {
  const vm = new CartViewModel();
  const seen = [];
  vm.total.subscribe(t => seen.push(t));
  vm.addItem({ name: 'Clavier', price: 49 });
  vm.removeAt(0);
  assert.deepEqual(seen, [0, 49, 0]);
});
