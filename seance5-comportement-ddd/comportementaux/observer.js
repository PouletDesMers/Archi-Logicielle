import { EventBus } from './EventBus.js';

const bus = new EventBus();
const stock = { SOURIS: 10 };

// Plusieurs observateurs indépendants, qui ne se connaissent pas entre eux
bus.on('order:paid', o => {
  o.items.forEach(i => (stock[i.sku] -= i.qty));
  console.log('  [stock] mis à jour :', stock);
});
bus.on('order:paid', o => console.log(`  [mail] reçu envoyé à ${o.customer}`));
const stopAnalytics = bus.on('order:paid', o =>
  console.log(`  [analytics] +${o.total} € de CA`),
);
bus.on('order:paid', () => {
  throw new Error('service fidélité indisponible');
});

console.log('Commande 1 payée :');
bus.emit('order:paid', {
  customer: 'alice@ecole.fr',
  items: [{ sku: 'SOURIS', qty: 2 }],
  total: 38,
});

stopAnalytics(); // désabonnement
console.log('Commande 2 payée (analytics désabonné) :');
bus.emit('order:paid', {
  customer: 'bob@ecole.fr',
  items: [{ sku: 'SOURIS', qty: 1 }],
  total: 19,
});

// Pattern natif : EventTarget (navigateur et Node), EventEmitter (Node)
const target = new EventTarget();
target.addEventListener('ping', e =>
  console.log('  [EventTarget natif] reçu :', e.detail),
);
target.dispatchEvent(new CustomEvent('ping', { detail: 'pong' }));
