// Décorateurs de devis : même contrat que les adapters
//   quote(order) -> Promise<{ carrier, priceEur, transitDays }>
// Ils s'empilent sans que le décoré sache qu'on l'enrichit.
// L'ordre de composition a un sens (voir PATTERNS.md).

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Réessaie un devis qui échoue (DHL répond parfois 503). */
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

/** Garde en mémoire les devis déjà obtenus (clé = poids + code postal). */
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
      // On mémorise la promesse : deux appels concurrents ne font qu'un aller-retour.
      this.#cache.set(key, this.inner.quote(order));
    }
    try {
      return await this.#cache.get(key);
    } catch (error) {
      this.#cache.delete(key); // un échec ne doit pas être mis en cache
      throw error;
    }
  }
}
