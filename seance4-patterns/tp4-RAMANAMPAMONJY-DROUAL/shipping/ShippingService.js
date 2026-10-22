const ZIP = /^\d{5}$/;

function assertOrder(order) {
  if (!order || typeof order !== 'object') {
    throw new TypeError('Commande attendue : { weightKg, zip }');
  }
  if (!Number.isFinite(order.weightKg) || order.weightKg <= 0) {
    throw new Error(`Poids invalide : ${order.weightKg} (kg, > 0 attendu)`);
  }
  if (!ZIP.test(String(order.zip))) {
    throw new Error(`Code postal invalide : ${order.zip} (5 chiffres attendus)`);
  }
}

const byPrice = (a, b) =>
  a.priceEur - b.priceEur ||
  a.transitDays - b.transitDays ||
  a.carrier.localeCompare(b.carrier);

const byDelay = (a, b) =>
  a.transitDays - b.transitDays || a.priceEur - b.priceEur;

export class ShippingService {
  #quoters;

  constructor({ quoters = [] } = {}) {
    this.#quoters = [];
    for (const quoter of quoters) this.use(quoter);
  }

  use(quoter) {
    if (typeof quoter?.quote !== 'function') {
      throw new TypeError('ShippingService : un devis doit exposer quote()');
    }
    this.#quoters.push(quoter);
    return this;
  }

  get carriers() {
    return this.#quoters.map((quoter) => quoter.name);
  }

  async quotes(order) {
    assertOrder(order);
    const settled = await Promise.allSettled(this.#quoters.map((q) => q.quote(order)));
    return settled.map((result, index) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            carrier: this.#quoters[index].name,
            priceEur: null,
            transitDays: null,
            error: result.reason?.message ?? String(result.reason),
          },
    );
  }

  async available(order) {
    return (await this.quotes(order)).filter((quote) => !quote.error).sort(byPrice);
  }

  async best(order) {
    return (await this.available(order))[0] ?? null;
  }

  async fastest(order) {
    return (await this.available(order)).sort(byDelay)[0] ?? null;
  }
}
