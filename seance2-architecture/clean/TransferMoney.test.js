// Test du cas d'utilisation : pas de serveur, pas de base de données.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TransferMoney } from './application/TransferMoney.js';
import { InMemoryAccountRepository } from './infrastructure/InMemoryAccountRepository.js';
import { InsufficientFundsError } from './domain/Account.js';

const setup = () =>
  new TransferMoney(
    new InMemoryAccountRepository([
      { id: 'A', owner: 'Alice', balance: 100 },
      { id: 'B', owner: 'Bob', balance: 0 },
    ]),
  );

test('un virement débite et crédite les comptes', async () => {
  assert.deepEqual(await setup().execute({ fromId: 'A', toId: 'B', amount: 30 }), {
    fromBalance: 70,
    toBalance: 30,
  });
});

test('un solde insuffisant est refusé', async () => {
  await assert.rejects(
    setup().execute({ fromId: 'A', toId: 'B', amount: 500 }),
    InsufficientFundsError,
  );
});
