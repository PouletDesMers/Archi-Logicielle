// Adaptateur primaire n°3 : les TESTS. Tous les ports sortants sont simulés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlaceOrder } from './application/PlaceOrder.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';

function build() {
  const sent = [];
  const repo = new InMemoryOrderRepository();
  const useCase = new PlaceOrder({
    orderRepository: repo,
    catalog: { priceOf: sku => ({ A: 10, B: 5 })[sku] },
    payment: { pay: async () => {} },
    notifier: { orderPlaced: async o => sent.push(o.id) },
    clock: { now: () => '2026-01-01T00:00:00Z' },
    ids: { next: () => 'CMD-TEST' },
  });
  return { useCase, repo, sent };
}

test('une commande valide est enregistrée et notifiée', async () => {
  const { useCase, repo, sent } = build();
  const order = await useCase.handle({
    customerId: 'C1',
    items: [
      { sku: 'A', qty: 2 },
      { sku: 'B', qty: 1 },
    ],
  });
  assert.equal(order.total, 25);
  assert.equal(order.statut, 'PAYEE');
  assert.equal((await repo.findById('CMD-TEST')).customerId, 'C1');
  assert.deepEqual(sent, ['CMD-TEST']);
});

test('produit inconnu : rien n’est enregistré', async () => {
  const { useCase, sent } = build();
  await assert.rejects(
    useCase.handle({ customerId: 'C1', items: [{ sku: 'Z', qty: 1 }] }),
    /Produit inconnu/,
  );
  assert.equal(sent.length, 0);
});

test('commande vide refusée par le domaine', async () => {
  await assert.rejects(
    build().useCase.handle({ customerId: 'C1', items: [] }),
    /au moins une ligne/,
  );
});

test('paiement refusé : rien n’est enregistré', async () => {
  const repo = new InMemoryOrderRepository();
  const useCase = new PlaceOrder({
    orderRepository: repo,
    catalog: { priceOf: () => 501 },
    payment: new FakePayment(),
    notifier: { orderPlaced: async () => {} },
    clock: { now: () => '2026-01-01T00:00:00Z' },
    ids: { next: () => 'CMD-EXPENSIVE' },
  });
  await assert.rejects(
    useCase.handle({ customerId: 'C1', items: [{ sku: 'A', qty: 1 }] }),
    /Paiement refusé/,
  );
  assert.equal(await repo.findById('CMD-EXPENSIVE'), undefined);
});
