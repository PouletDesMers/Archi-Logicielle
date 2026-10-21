// Adaptateur primaire n°2 : la LIGNE DE COMMANDE pilote le même cas d'utilisation.
// Usage : node cli.js C-42 CLAVIER:2 SOURIS:1
import { buildApp } from './container.js';

const { placeOrder } = buildApp();
const [customerId = 'C-42', ...specs] = process.argv.slice(2);
const items = (specs.length ? specs : ['CLAVIER:2', 'SOURIS:1']).map(s => {
  const [sku, qty] = s.split(':');
  return { sku, qty: Number(qty) };
});
try {
  const order = await placeOrder.handle({ customerId, items });
  console.log('Commande créée :', JSON.stringify(order.toJSON()));
} catch (e) {
  console.error('Erreur :', e.message);
}
