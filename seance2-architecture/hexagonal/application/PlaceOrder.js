// PORT ENTRANT (cas d'utilisation) : « passer une commande ».
// Il dépend de PORTS SORTANTS injectés, décrits ici par leur contrat :
//   orderRepository : { save(order), findById(id) }
//   catalog         : { priceOf(sku) }            -> prix unitaire ou undefined
//   notifier        : { orderPlaced(order) }
//   clock / ids     : { now() } / { next() }       -> rend le code déterministe en test
import { Order } from '../domain/Order.js';

export class PlaceOrder {
  constructor({ orderRepository, catalog, notifier, clock, ids }) {
    Object.assign(this, { orderRepository, catalog, notifier, clock, ids });
  }

  async handle({ customerId, items }) {
    const lines = (items ?? []).map(({ sku, qty }) => {
      const unitPrice = this.catalog.priceOf(sku);
      if (unitPrice === undefined) throw new Error(`Produit inconnu : ${sku}`);
      return { sku, qty, unitPrice };
    });
    const order = new Order(this.ids.next(), customerId, lines, this.clock.now());
    await this.orderRepository.save(order);
    await this.notifier.orderPlaced(order);
    return order;
  }
}
