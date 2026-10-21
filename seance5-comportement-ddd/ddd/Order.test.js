import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Money } from './domain/Money.js';
import { Customer } from './domain/Customer.js';
import { Order } from './domain/Order.js';

const rich = new Customer('C1', 'A', 'a@b.fr', Money.euros(1000));
const poor = new Customer('C2', 'B', 'b@b.fr', Money.euros(10));

test('Money est immuable et comparé par valeur', () => {
  const m = Money.euros(10);
  assert.throws(() => {
    m.cents = 0;
  }); // les modules ES sont en mode strict
  assert.ok(m.equals(Money.euros(10)));
  assert.equal(Money.euros(0.1).add(Money.euros(0.2)).toString(), '0.30 EUR');
});

test('confirmer publie OrderConfirmed', () => {
  const o = new Order('O1', 'C1');
  o.addLine('A', 2, Money.euros(10));
  o.confirm(rich);
  assert.equal(o.status, 'CONFIRMED');
  assert.deepEqual(
    o.pullEvents().map(e => e.type),
    ['OrderConfirmed'],
  );
  assert.equal(o.pullEvents().length, 0); // événements consommés une seule fois
});

test('encours dépassé : commande mise en attente', () => {
  const o = new Order('O2', 'C2');
  o.addLine('A', 1, Money.euros(50));
  o.confirm(poor);
  assert.equal(o.status, 'ON_HOLD');
});

test('une commande confirmée n’est plus modifiable', () => {
  const o = new Order('O3', 'C1');
  o.addLine('A', 1, Money.euros(5));
  o.confirm(rich);
  assert.throws(() => o.addLine('B', 1, Money.euros(5)), /non modifiable/);
});
