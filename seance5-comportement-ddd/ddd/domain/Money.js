// VALUE OBJECT : défini par ses valeurs, immuable, toujours valide.
// Montants stockés en CENTIMES entiers pour éviter 0.1 + 0.2 = 0.30000000000000004
export class Money {
  constructor(cents, currency = 'EUR') {
    if (!Number.isInteger(cents))
      throw new Error('Montant en centimes entiers attendu');
    if (cents < 0) throw new Error('Montant négatif interdit');
    this.cents = cents;
    this.currency = currency;
    Object.freeze(this);
  }
  static euros(value, currency = 'EUR') {
    return new Money(Math.round(value * 100), currency);
  }
  add(other) {
    this.#sameCurrency(other);
    return new Money(this.cents + other.cents, this.currency);
  }
  multiply(factor) {
    return new Money(Math.round(this.cents * factor), this.currency);
  }
  equals(other) {
    return (
      other instanceof Money &&
      other.cents === this.cents &&
      other.currency === this.currency
    );
  }
  toString() {
    return `${(this.cents / 100).toFixed(2)} ${this.currency}`;
  }
  #sameCurrency(o) {
    if (o.currency !== this.currency)
      throw new Error(`Devises différentes : ${this.currency}/${o.currency}`);
  }
}
