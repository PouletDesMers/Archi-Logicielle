export const PRIORITIES = Object.freeze(['basse', 'normale', 'haute']);

const VARIABLE = /\{\{\s*([\w.-]+)\s*\}\}/g;

export class MessageBuilder {
  #to;
  #template = '';
  #variables = new Map();
  #priority = 'normale';

  to(value) {
    this.#to = value;
    return this;
  }

  template(value) {
    this.#template = String(value ?? '').trim();
    return this;
  }

  with(name, value) {
    this.#variables.set(name, value);
    return this;
  }

  priority(value) {
    this.#priority = value;
    return this;
  }

  build() {
    if (!this.#to) throw new Error('Destinataire obligatoire');
    if (!this.#template) throw new Error('Gabarit obligatoire');
    if (!PRIORITIES.includes(this.#priority)) {
      throw new Error(`Priorité invalide : ${this.#priority}`);
    }

    const body = this.#template.replace(VARIABLE, (_match, name) => {
      if (!this.#variables.has(name)) throw new Error(`Variable manquante : ${name}`);
      return String(this.#variables.get(name));
    });

    return Object.freeze({ to: this.#to, body, priority: this.#priority });
  }
}
