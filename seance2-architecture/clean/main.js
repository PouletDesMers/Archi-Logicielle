// COMPOSITION ROOT : le seul endroit qui connaît toutes les classes concrètes.
import { InMemoryAccountRepository } from './infrastructure/InMemoryAccountRepository.js';
import { TransferMoney } from './application/TransferMoney.js';
import { makeCliController } from './interfaces/cliController.js';

const repo = new InMemoryAccountRepository([
  { id: 'FR-001', owner: 'Alice', balance: 500 },
  { id: 'FR-002', owner: 'Bob', balance: 100 },
]);
const handle = makeCliController(new TransferMoney(repo));

// Usage : node main.js FR-001 FR-002 50   (sinon, scénario de démonstration)
const args = process.argv.slice(2);
if (args.length === 3) console.log(await handle(...args));
else
  for (const a of [
    ['FR-001', 'FR-002', '200'],
    ['FR-002', 'FR-001', '9999'],
    ['FR-001', 'FR-001', '10'],
    ['FR-001', 'XX-999', '10'],
  ])
    console.log(await handle(...a));
