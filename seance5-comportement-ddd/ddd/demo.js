// Service applicatif + repository en mémoire + publication des événements du domaine.
import { Money } from './domain/Money.js';
import { Customer } from './domain/Customer.js';
import { Order } from './domain/Order.js';

// 1) Value Object vs Entity
console.log('1) Value Object et Entity');
console.log(
  '   0.1 + 0.2 en JS =',
  0.1 + 0.2,
  '→ Money :',
  Money.euros(0.1).add(Money.euros(0.2)).toString(),
);
console.log(
  '   Money(10€) égal à Money(10€) ?',
  Money.euros(10).equals(Money.euros(10)),
);
const alice = new Customer('C-1', 'Alice', 'alice@ecole.fr', Money.euros(150));
const homonyme = new Customer('C-2', 'Alice', 'alice@ecole.fr', Money.euros(150));
console.log(
  '   deux clientes « Alice » identiques ?',
  alice.equals(homonyme),
  '(identités différentes)',
);

// 2) Repository (collection d'agrégats) et bus d'événements, en mémoire
const orders = new Map();
const repo = {
  findById: async id => orders.get(id),
  save: async o => orders.set(o.id, o),
};
const bus = {
  publish: e => console.log(`   [événement] ${e.type}`, JSON.stringify(e)),
};

// 3) Service applicatif : orchestre l'agrégat, sauvegarde, puis publie
async function confirmOrder(orderId, customer) {
  const order = await repo.findById(orderId);
  order.confirm(customer); // la règle métier est DANS l'agrégat
  await repo.save(order); // une transaction = un agrégat
  order.pullEvents().forEach(bus.publish); // publication après sauvegarde
  return order.status;
}

console.log('2) Agrégat Order');
const o1 = new Order('CMD-1', alice.id);
o1.addLine('CLAVIER', 1, Money.euros(49));
o1.addLine('SOURIS', 2, Money.euros(19.5));
o1.addLine('SOURIS', 1, Money.euros(19.5)); // fusionnée avec la ligne existante
await repo.save(o1);
console.log('   total =', o1.total.toString());
console.log('   statut :', await confirmOrder('CMD-1', alice));

const o2 = new Order('CMD-2', alice.id);
o2.addLine('ECRAN', 1, Money.euros(299));
await repo.save(o2);
console.log('   statut :', await confirmOrder('CMD-2', alice));

for (const attempt of [
  () => o1.addLine('CABLE', 1, Money.euros(5)),
  () => new Order('CMD-3', 'C-1').confirm(alice),
  () => Money.euros(-1),
]) {
  try {
    attempt();
  } catch (e) {
    console.log('   ✗ invariant protégé :', e.message);
  }
}
