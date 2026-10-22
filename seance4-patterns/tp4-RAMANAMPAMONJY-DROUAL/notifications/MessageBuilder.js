// Construction pas à pas d'un message, puis objet figé (immuable).
// Évite le constructeur à 6 paramètres dont on ne sait plus lequel est lequel.

export const PRIORITIES = Object.freeze(['low', 'normal', 'high']);

export class MessageBuilder {
  #to;
  #subject = '';
  #body = '';
  #priority = 'normal';

  static create() {
    return new MessageBuilder();
  }

  to(value) {
    this.#to = value;
    return this;
  }

  subject(value) {
    this.#subject = String(value ?? '').trim();
    return this;
  }

  body(value) {
    this.#body = String(value ?? '').trim();
    return this;
  }

  /** Ajoute une ligne au corps (sans se soucier des \n). */
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
    if (!this.#subject) throw new Error('MessageBuilder : sujet manquant');
    if (!this.#body) throw new Error('MessageBuilder : corps manquant');
    return Object.freeze({
      to: this.#to,
      subject: this.#subject,
      body: this.#body,
      priority: this.#priority,
    });
  }
}
