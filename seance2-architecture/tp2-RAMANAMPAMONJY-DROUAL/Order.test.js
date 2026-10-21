import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './domain/Order.js';

test('une commande calcule son total', () => {
  const order = new Order('CMD-1', 'C1', [
    { sku: 'A', qty: 2, unitPrice: 10 },
    { sku: 'B', qty: 1, unitPrice: 5 },
  ], '2026-01-01T00:00:00Z');

  assert.equal(order.total, 25);
  assert.equal(order.customerId, 'C1');
});

test('une commande vide est refusée', () => {
  assert.throws(
    () => new Order('CMD-1', 'C1', [], '2026-01-01T00:00:00Z'),
    /au moins une ligne/,
  );
});

test('une quantité invalide est refusée', () => {
  assert.throws(
    () => new Order('CMD-1', 'C1', [{ sku: 'A', qty: 0, unitPrice: 10 }], '2026-01-01T00:00:00Z'),
    /Quantité invalide/,
  );
});
