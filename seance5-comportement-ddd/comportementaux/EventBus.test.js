import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from './EventBus.js';

test('tous les observateurs reçoivent l’événement', () => {
  const bus = new EventBus();
  const got = [];
  bus.on('e', x => got.push('a' + x));
  bus.on('e', x => got.push('b' + x));
  bus.emit('e', 1);
  assert.deepEqual(got, ['a1', 'b1']);
});

test('le désabonnement fonctionne', () => {
  const bus = new EventBus();
  let n = 0;
  const off = bus.on('e', () => n++);
  bus.emit('e');
  off();
  bus.emit('e');
  assert.equal(n, 1);
});
