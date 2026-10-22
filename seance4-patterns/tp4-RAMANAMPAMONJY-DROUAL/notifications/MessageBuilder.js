export const PRIORITIES = Object.freeze(['low', 'normal', 'high']);

export class MessageBuilder {
  #to;
  #body = '';
  #priority = 'normal';

  static create() {
    return new MessageBuilder();
  }

  to(value) {
    this.#to = value;
    return this;
  }

  body(value) {
    this.#body = String(value ?? '').trim();
    return this;
  }

  line(value) {
    const l = String(value ?? '').trim();
    if (l) this.#body = this.#body ? `${this.#body}\n${l}` : l;
    return this;
  }

  priority(value) {
    if (!PRIORITIES.includes(value)) {
      throw new Error(`priorité inconnue : « ${value} » (attendu : ${PRIORITIES.join(', ')})`);
    }
    this.#priority = value;
    return this;
  }

  build() {
    if (!this.#body) throw new Error('MessageBuilder : corps manquant');
    return Object.freeze({
      to: this.#to,
      body: this.#body,
      priority: this.#priority,
    });
  }
}
