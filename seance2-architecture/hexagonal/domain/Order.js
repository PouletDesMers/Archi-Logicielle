// DOMAINE : l'entité Order et ses invariants. Aucun import technique.
export class Order {
  #lines;
  constructor(id, customerId, lines, createdAt) {
    if (!customerId) throw new Error('Client obligatoire');
    if (!lines?.length)
      throw new Error('Une commande doit contenir au moins une ligne');
    for (const l of lines)
      if (!(l.qty > 0)) throw new Error(`Quantité invalide pour ${l.sku}`);
    this.id = id;
    this.customerId = customerId;
    this.#lines = lines.map(l => ({ ...l }));
    this.createdAt = createdAt;
  }
  get lines() {
    return this.#lines.map(l => ({ ...l }));
  }
  get total() {
    return this.#lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  }
  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      lines: this.lines,
      total: this.total,
      createdAt: this.createdAt,
    };
  }
}
