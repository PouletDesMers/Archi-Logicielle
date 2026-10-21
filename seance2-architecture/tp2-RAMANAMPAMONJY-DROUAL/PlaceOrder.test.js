// Adaptateur primaire n°3 : les TESTS. Tous les ports sortants sont simulés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlaceOrder } from './application/PlaceOrder.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';

function build({ ids = () => 'CMD-TEST', notifier } = {}) {
  const sent = [];
  const repo = new InMemoryOrderRepository();
  const useCase = new PlaceOrder({
    orderRepository: repo,
    catalog: new StaticCatalog(),
    payment: new FakePayment(),
    notifier: notifier ?? { orderPlaced: async o => sent.push(o.id) },
    clock: { now: () => '2026-01-01T00:00:00Z' },
    ids: { next: ids },
  });
  return { useCase, repo, sent };
}

test('commande de 117 € : payée, enregistrée et notifiée', async () => {
  const { useCase, repo, sent } = build();
  const order = await useCase.handle({
    customerId: 'C1',
    items: [
      { sku: 'CLAVIER', qty: 2 },
      { sku: 'SOURIS', qty: 1 },
    ],
  });
  assert.equal(order.total, 117);
  assert.equal(order.statut, 'PAYEE');
  assert.equal((await repo.findById('CMD-TEST')).customerId, 'C1');
  assert.deepEqual(sent, ['CMD-TEST']);
});

test('commande de 598 € : refusée, enregistrée et non notifiée', async () => {
  const { useCase, repo, sent } = build({ ids: () => 'CMD-EXPENSIVE' });
  const order = await useCase.handle({
    customerId: 'C1',
    items: [{ sku: 'ECRAN', qty: 2 }],
  });

  assert.equal(order.total, 598);
  assert.equal(order.statut, 'REFUSEE');
  assert.match(order.motif, /500/);
  assert.equal((await repo.findById('CMD-EXPENSIVE')).statut, 'REFUSEE');
  assert.deepEqual(sent, []);
});

test('produit inconnu : erreur et rien n’est enregistré', async () => {
  const { useCase, repo, sent } = build();
  await assert.rejects(
    useCase.handle({ customerId: 'C1', items: [{ sku: 'INCONNU', qty: 1 }] }),
    /Produit inconnu/,
  );
  assert.equal(await repo.findById('CMD-TEST'), null);
  assert.equal(sent.length, 0);
});

test('commande vide refusée par le domaine', async () => {
  await assert.rejects(
    build().useCase.handle({ customerId: 'C1', items: [] }),
    /au moins une ligne/,
  );
});
