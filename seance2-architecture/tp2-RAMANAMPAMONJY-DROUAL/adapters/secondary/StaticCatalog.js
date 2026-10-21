// ADAPTATEUR SECONDAIRE : catalogue en dur (remplacerait un service ou une base).
export class StaticCatalog {
  #prices = { 'LIVRE-DDD': 45, CLAVIER: 49, SOURIS: 19 };
  priceOf(sku) {
    return this.#prices[sku];
  }
}
