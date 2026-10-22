// NOUVEAU canal, ajouté SANS modifier channels.js.
// Importer ce module suffit : l'enregistrement est un effet de bord assumé
// (c'est la mécanique d'un plugin). channels.js n'a pas changé d'une ligne.
import { Channel, registerChannel } from './channels.js';

export class SlackChannel extends Channel {
  constructor({
    webhook = 'https://hooks.slack.example/T000/B000',
    username = 'shoplite-bot',
  } = {}) {
    super('slack');
    this.webhook = webhook;
    this.username = username;
    this.posted = [];
  }

  send(message) {
    if (!message?.subject) throw new Error('SlackChannel : sujet manquant');
    const post = {
      webhook: this.webhook,
      username: this.username,
      text: `*${message.subject}*\n${message.body}`,
    };
    this.posted.push(post);
    return { channel: this.name, ...post };
  }
}

export function registerSlackChannel() {
  registerChannel('slack', (options) => new SlackChannel(options));
}

registerSlackChannel();
