import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './domain/Order.js';

const baseOrder = overrides => new Order({
  id: 'CMD-1',
  customerId: 'C1',
  lines: [{ sku: 'A', qty: 1, unitPrice: 10 }],
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

test('une commande neuve est EN_ATTENTE et calcule son total', () => {
  const order = new Order({
    id: 'CMD-1',
    customerId: 'C1',
    lines: [
      { sku: 'CLAVIER', qty: 2, unitPrice: 49 },
      { sku: 'SOURIS', qty: 1, unitPrice: 19 },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  });

  assert.equal(order.total, 117);
  assert.equal(order.statut, 'EN_ATTENTE');
});

test('refuse une commande vide, sans client ou avec une quantité invalide', () => {
  assert.throws(() => baseOrder({ customerId: '', lines: [{ sku: 'A', qty: 1, unitPrice: 10 }] }), /Client obligatoire/);
  assert.throws(() => baseOrder({ lines: [] }), /au moins une ligne/);
  assert.throws(() => baseOrder({ lines: [{ sku: 'A', qty: 0, unitPrice: 10 }] }), /Quantité invalide/);
  assert.throws(() => baseOrder({ lines: [{ sku: 'A', qty: 1.5, unitPrice: 10 }] }), /Quantité invalide/);
});

test('une commande payée ne peut pas être refusée ensuite', () => {
  const order = baseOrder();

  order.marquerPayee();
  assert.equal(order.statut, 'PAYEE');
  assert.throws(() => order.marquerRefusee('Carte bancaire refusée'), /Commande déjà traitée/);
});
