const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class RetryQuote {
  #attempts;
  #delayMs;
  #onRetry;

  constructor(inner, { attempts = 3, delayMs = 0, onRetry = () => {} } = {}) {
    if (typeof inner?.quote !== 'function') {
      throw new TypeError('RetryQuote : un devis (quote) est requis');
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

  async quote(order) {
    let lastError;
    for (let attempt = 1; attempt <= this.#attempts; attempt++) {
      try {
        return await this.inner.quote(order);
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
}

export class CachedQuote {
  #cache = new Map();
  #keyOf;

  constructor(inner, { keyOf = (order) => `${order.weightKg}|${order.zip}` } = {}) {
    if (typeof inner?.quote !== 'function') {
      throw new TypeError('CachedQuote : un devis (quote) est requis');
    }
    this.inner = inner;
    this.#keyOf = keyOf;
  }

  get name() {
    return `${this.inner.name}+cache`;
  }

  get size() {
    return this.#cache.size;
  }

  async quote(order) {
    const key = this.#keyOf(order);
    if (!this.#cache.has(key)) {
      this.#cache.set(key, this.inner.quote(order));
    }
    try {
      return await this.#cache.get(key);
    } catch (error) {
      this.#cache.delete(key);
      throw error;
    }
  }
}
