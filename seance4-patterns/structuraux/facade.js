// Facade : une interface simple devant un sous-système complexe.

// Sous-systèmes (simulés)
class Inventory {
  stock = new Map([
    ['CLAVIER', 5],
    ['SOURIS', 0],
  ]);
  reserve(sku, qty) {
    const left = this.stock.get(sku) ?? 0;
    if (left < qty) throw new Error(`Stock insuffisant pour ${sku}`);
    this.stock.set(sku, left - qty);
  }
  release(sku, qty) {
    this.stock.set(sku, (this.stock.get(sku) ?? 0) + qty);
  }
}
class Payment {
  async charge(customer, amount) {
    if (amount > customer.creditLimit) throw new Error('Paiement refusé');
    return `PAY-${amount}`;
  }
}
class Shipping {
  async schedule(address) {
    return `COLIS-${address.slice(0, 3).toUpperCase()}-001`;
  }
}
class Mailer {
  async send(to, subject) {
    console.log(`  [mail] ${to} : ${subject}`);
  }
}

// FAÇADE : un seul point d'entrée pour le scénario « passer commande »
class CheckoutFacade {
  constructor({ inventory, payment, shipping, mailer }) {
    Object.assign(this, { inventory, payment, shipping, mailer });
  }

  async placeOrder(cart, customer) {
    const reserved = [];
    try {
      for (const i of cart.items) {
        this.inventory.reserve(i.sku, i.qty);
        reserved.push(i);
      }
      await this.payment.charge(customer, cart.total);
    } catch (e) {
      reserved.forEach(i => this.inventory.release(i.sku, i.qty)); // compensation
      throw e;
    }
    const tracking = await this.shipping.schedule(customer.address);
    await this.mailer.send(customer.email, `Commande expédiée, suivi ${tracking}`);
    return tracking;
  }
}

const inventory = new Inventory();
const checkout = new CheckoutFacade({
  inventory,
  payment: new Payment(),
  shipping: new Shipping(),
  mailer: new Mailer(),
});
const alice = { email: 'alice@ecole.fr', address: 'Paris 11e', creditLimit: 200 };

console.log(
  'Commande 1 :',
  await checkout.placeOrder({ items: [{ sku: 'CLAVIER', qty: 2 }], total: 98 }, alice),
);
for (const [label, cart] of [
  ['Commande 2', { items: [{ sku: 'SOURIS', qty: 1 }], total: 19 }],
  ['Commande 3', { items: [{ sku: 'CLAVIER', qty: 1 }], total: 999 }],
]) {
  try {
    await checkout.placeOrder(cart, alice);
  } catch (e) {
    console.log(`${label} : ✗ ${e.message}`);
  }
}
console.log('Stock clavier après compensation :', inventory.stock.get('CLAVIER'));
