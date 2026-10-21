// Strategy : une famille d'algorithmes interchangeables.
// En JavaScript, une stratégie est souvent une simple fonction.
const shippingStrategies = {
  standard: total => (total >= 50 ? 0 : 4.9),
  express: () => 12.9,
  pickup: () => 0,
  weekend: total => Math.max(6.9, total * 0.05),
};

class Checkout {
  constructor(strategy = shippingStrategies.standard) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  total(items) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = this.strategy(subtotal);
    return { subtotal, shipping, total: +(subtotal + shipping).toFixed(2) };
  }
}

const cart = [{ price: 19, qty: 2 }]; // 38 €
const checkout = new Checkout();
for (const [name, strategy] of Object.entries(shippingStrategies)) {
  checkout.setStrategy(strategy); // changement à l'exécution
  const r = checkout.total(cart);
  console.log(
    `${name.padEnd(9)} : ${r.subtotal} € + ${r.shipping} € de port = ${r.total} €`,
  );
}

// Nouvelle stratégie sans modifier Checkout (OCP) :
shippingStrategies.vip = () => 0;
checkout.setStrategy(shippingStrategies.vip);
console.log('vip       :', checkout.total(cart).total, '€');
