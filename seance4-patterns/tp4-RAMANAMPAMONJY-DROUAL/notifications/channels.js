export class Channel {
  send() {
    throw new Error('méthode abstraite : send() doit être implémentée par une sous-classe');
  }
}

export class EmailChannel extends Channel {
  send({ to, body }) {
    return `[EMAIL → ${to}] ${body}`;
  }
}

export class SmsChannel extends Channel {
  static MAX_LENGTH = 160;

  send({ to, body }) {
    return `[SMS → ${to}] ${String(body).slice(0, SmsChannel.MAX_LENGTH)}`;
  }
}

export class PushChannel extends Channel {
  send({ to, body }) {
    return `[PUSH → ${to}] ${body}`;
  }
}

const registry = new Map();

export function registerChannel(type, Classe) {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('registerChannel : type de canal invalide');
  }
  if (typeof Classe !== 'function' || !(Classe.prototype instanceof Channel)) {
    throw new TypeError(`registerChannel(${type}) : une classe héritant de Channel est attendue`);
  }
  registry.set(type, Classe);
  return () => registry.delete(type);
}

export function createChannel(type, options = {}) {
  const Classe = registry.get(type);
  if (!Classe) {
    const dispo = [...registry.keys()].sort().join(', ') || '(aucun)';
    throw new Error(`Canal inconnu : ${type} (disponibles : ${dispo})`);
  }
  return new Classe(options);
}

export function availableChannels() {
  return [...registry.keys()].sort();
}

registerChannel('email', EmailChannel);
registerChannel('sms', SmsChannel);
registerChannel('push', PushChannel);
