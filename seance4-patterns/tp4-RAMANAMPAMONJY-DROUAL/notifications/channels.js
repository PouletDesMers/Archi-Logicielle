// Canaux de notification + fabrique OUVERTE (registre).
// Règle du TP : ajouter un canal ne doit jamais obliger à modifier ce fichier.
// Ici on enregistre une fabrique, on ne touche pas au `switch` d'un `if/else`.

export class Channel {
  constructor(name) {
    if (!name) throw new Error('Channel : un nom est requis');
    this.name = name;
  }

  // Contrat commun : send(message) -> reçu (objet simple, sans horodatage,
  // donc comparable dans un test).
  send() {
    throw new Error(`Channel « ${this.name} » : send() n'est pas implémenté`);
  }
}

export class EmailChannel extends Channel {
  #outbox = [];

  constructor({ from = 'no-reply@shoplite.fr' } = {}) {
    super('email');
    this.from = from;
  }

  get sent() {
    return [...this.#outbox];
  }

  send(message) {
    if (!message?.to) throw new Error('EmailChannel : destinataire (to) manquant');
    const mail = {
      from: this.from,
      to: message.to,
      subject: message.subject,
      body: message.body,
    };
    this.#outbox.push(mail);
    return { channel: this.name, ...mail };
  }
}

export class SmsChannel extends Channel {
  static MAX_LENGTH = 160;

  constructor({ from = 'SHOPLITE' } = {}) {
    super('sms');
    this.from = from;
  }

  send(message) {
    if (!message?.to) throw new Error('SmsChannel : numéro (to) manquant');
    const text = `${message.subject} : ${message.body}`.slice(0, SmsChannel.MAX_LENGTH);
    return { channel: this.name, from: this.from, to: message.to, text };
  }
}

export class PushChannel extends Channel {
  constructor({ app = 'ShopLite' } = {}) {
    super('push');
    this.app = app;
  }

  send(message) {
    if (!message?.to) throw new Error('PushChannel : appareil (to) manquant');
    return {
      channel: this.name,
      app: this.app,
      device: message.to,
      title: String(message.subject ?? '').slice(0, 60),
      body: message.body,
    };
  }
}

// --- Registre des canaux -----------------------------------------------------

const factories = new Map();

/** Enregistre un canal. Renvoie une fonction de désinscription (utile aux tests). */
export function registerChannel(name, factory) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('registerChannel : nom de canal invalide');
  }
  if (typeof factory !== 'function') {
    throw new TypeError(`registerChannel(${name}) : une fabrique (options) => Channel est attendue`);
  }
  factories.set(name, factory);
  return () => factories.delete(name);
}

export function createChannel(name, options = {}) {
  const factory = factories.get(name);
  if (!factory) {
    const dispo = [...factories.keys()].sort().join(', ') || '(aucun)';
    throw new Error(`Canal inconnu : « ${name} » (disponibles : ${dispo})`);
  }
  return factory(options);
}

export function availableChannels() {
  return [...factories.keys()].sort();
}

// Canaux fournis : enregistrés une fois, au chargement du module.
registerChannel('email', (options) => new EmailChannel(options));
registerChannel('sms', (options) => new SmsChannel(options));
registerChannel('push', (options) => new PushChannel(options));
