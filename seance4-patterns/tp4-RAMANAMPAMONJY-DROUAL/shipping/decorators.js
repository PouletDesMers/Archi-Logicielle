const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const methodOf = (inner) => inner?.getQuote ?? inner?.quote;
const legacyQuote = (quote) => quote.price === undefined
  ? quote
  : { carrier: quote.carrier.toLowerCase(), priceEur: quote.price, transitDays: quote.days };

export class RetryQuote {
  #attempts;
  #delayMs;
  #onRetry;

  constructor(inner, { attempts = 3, delayMs = 0, onRetry = () => {} } = {}) {
    if (typeof methodOf(inner) !== 'function') {
      throw new TypeError('RetryQuote : un devis (getQuote) est requis');
    }
    if (!Number.isInteger(attempts) || attempts < 1) {
      throw new RangeError(`RetryQuote : attempts doit être >= 1 (reçu ${attempts})`);
    }
    this.inner = inner;
    this.#attempts = attempts;
    this.#delayMs = delayMs;
    this.#onRetry = onRetry;
  }

  get name() {
    return `${this.inner.name}+retry`;
  }

  async getQuote(order) {
    let lastError;
    for (let attempt = 1; attempt <= this.#attempts; attempt++) {
      try {
        return await methodOf(this.inner).call(this.inner, order);
      } catch (error) {
        lastError = error;
        this.#onRetry({ attempt, error });
        if (attempt < this.#attempts && this.#delayMs > 0) await sleep(this.#delayMs);
      }
    }
    throw new Error(
      `${this.inner.name} indisponible après ${this.#attempts} tentative(s) : ${lastError?.message}`,
      { cause: lastError },
    );
  }

  async quote(order) { return legacyQuote(await this.getQuote(order)); }
}

export class CachedQuote {
  #cache = new Map();
  #keyOf;

  constructor(inner, { ttlMs = 60000, now = Date.now, keyOf } = {}) {
    if (typeof methodOf(inner) !== 'function') {
      throw new TypeError('CachedQuote : un devis (getQuote) est requis');
    }
    this.inner = inner;
    this.#keyOf = keyOf ?? ((order) => `${order.weightKg}|${order.zip}`);
    this.ttlMs = ttlMs;
    this.now = now;
  }

  get name() {
    return `${this.inner.name}+cache`;
  }

  get size() {
    return this.#cache.size;
  }

  async getQuote(order) {
    const key = this.#keyOf(order);
    const cached = this.#cache.get(key);
    if (cached && this.now() - cached.createdAt < this.ttlMs) {
      return cached.promise;
    }
    const promise = methodOf(this.inner).call(this.inner, order);
    this.#cache.set(key, { promise, createdAt: this.now() });
    try {
      return await promise;
    } catch (error) {
      if (this.#cache.get(key)?.promise === promise) this.#cache.delete(key);
      throw error;
    }
  }

  async quote(order) { return legacyQuote(await this.getQuote(order)); }
}
