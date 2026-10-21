// AGRÉGAT : Order est la RACINE. On ne modifie les lignes qu'à travers elle,
// ce qui garantit les invariants. Les faits importants deviennent des DOMAIN EVENTS.
import { Money } from './Money.js';

export class Order {
  #lines = [];
  #status = 'DRAFT';
  #events = [];

  constructor(id, customerId) {
    this.id = id;
    this.customerId = customerId;
  }

  get status() {
    return this.#status;
  }
  get total() {
    return this.#lines.reduce(
      (sum, l) => sum.add(l.unitPrice.multiply(l.qty)),
      new Money(0),
    );
  }

  addLine(sku, qty, unitPrice) {
    this.#assertDraft();
    if (!Number.isInteger(qty) || qty <= 0) throw new Error('Quantité invalide');
    const existing = this.#lines.find(l => l.sku === sku);
    if (existing) {
      existing.qty += qty;
      return;
    } // invariant : une seule ligne par produit
    if (this.#lines.length >= 10)
      throw new Error('10 produits différents maximum par commande');
    this.#lines.push({ sku, qty, unitPrice });
  }

  confirm(customer) {
    this.#assertDraft();
    if (this.#lines.length === 0)
      throw new Error('Impossible de confirmer une commande vide');
    if (!customer.canAfford(this.total)) {
      this.#status = 'ON_HOLD';
      this.#events.push({
        type: 'OrderPutOnHold',
        orderId: this.id,
        reason: 'encours dépassé',
      });
      return;
    }
    this.#status = 'CONFIRMED';
    this.#events.push({
      type: 'OrderConfirmed',
      orderId: this.id,
      total: this.total.toString(),
    });
  }

  pullEvents() {
    const e = this.#events;
    this.#events = [];
    return e;
  }
  #assertDraft() {
    if (this.#status !== 'DRAFT')
      throw new Error(`Commande ${this.#status} : non modifiable`);
  }
}
