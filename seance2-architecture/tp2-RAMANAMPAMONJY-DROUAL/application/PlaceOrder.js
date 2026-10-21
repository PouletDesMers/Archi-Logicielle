// PORT ENTRANT (cas d'utilisation) : « passer une commande ».
// Il dépend de PORTS SORTANTS injectés, décrits ici par leur contrat :
//   orderRepository : { save(order), findById(id) }
//   catalog         : { priceOf(sku) }            -> prix unitaire ou undefined
//   payment         : { pay(order) }
//   notifier        : { orderPlaced(order) }
//   clock / ids     : { now() } / { next() }       -> rend le code déterministe en test
import { Order } from '../domain/Order.js';

export class PlaceOrder {
  constructor({ orderRepository, catalog, payment, notifier, clock, ids }) {
    Object.assign(this, { orderRepository, catalog, payment, notifier, clock, ids });
  }

  async handle({ customerId, items }) {
    const lines = (items ?? []).map(({ sku, qty }) => {
      const unitPrice = this.catalog.priceOf(sku);
      if (unitPrice === undefined) throw new Error(`Produit inconnu : ${sku}`);
      return { sku, qty, unitPrice };
    });
    const order = new Order({
      id: this.ids.next(),
      customerId,
      lines,
      createdAt: this.clock.now(),
    });
    await this.payment.pay(order);
    order.marquerPayee();
    await this.orderRepository.save(order);
    await this.notifier.orderPlaced(order);
    return order;
  }
}
