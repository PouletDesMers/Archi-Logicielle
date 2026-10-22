// Vérification du TP 4 : node --test seance4-patterns/tp4-RAMANAMPAMONJY-DROUAL/tp4.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  Channel,
  createChannel,
  registerChannel,
  availableChannels,
} from './notifications/channels.js';
import './notifications/slack.js';
import { MessageBuilder } from './notifications/MessageBuilder.js';
import { ColissimoAdapter, DhlAdapter } from './shipping/adapters.js';
import { RetryQuote, CachedQuote } from './shipping/decorators.js';
import { ShippingService } from './shipping/ShippingService.js';
import { DhlClient } from '../tp4/carrierApis.js';

const ORDER = { weightKg: 1.2, zip: '75011' };
const MESSAGE = { to: 'logistique@shoplite.fr', subject: 'Devis transport', body: 'Colis 1.2 kg' };

// --- Builder ----------------------------------------------------------------

test('MessageBuilder construit un message figé', () => {
  const message = MessageBuilder.create()
    .to('a@b.fr')
    .subject('  Devis  ')
    .line('ligne 1')
    .line('ligne 2')
    .priority('high')
    .build();

  assert.deepEqual(message, {
    to: 'a@b.fr',
    subject: 'Devis',
    body: 'ligne 1\nligne 2',
    priority: 'high',
  });
  assert.ok(Object.isFrozen(message));
});

test('MessageBuilder refuse un message sans sujet ou sans corps', () => {
  assert.throws(() => MessageBuilder.create().body('x').build(), /sujet manquant/);
  assert.throws(() => MessageBuilder.create().subject('x').build(), /corps manquant/);
});

test('MessageBuilder refuse une priorité inconnue', () => {
  assert.throws(() => MessageBuilder.create().priority('urgent'), /priorité inconnue/);
});

// --- Canaux : fabrique ouverte ---------------------------------------------

test('createChannel("email") envoie et garde une copie', () => {
  const email = createChannel('email');
  const receipt = email.send(MESSAGE);

  assert.equal(receipt.channel, 'email');
  assert.equal(receipt.to, 'logistique@shoplite.fr');
  assert.equal(email.sent.length, 1);
});

test('un canal inconnu est refusé avec la liste des canaux', () => {
  assert.throws(() => createChannel('fax'), /Canal inconnu : « fax » \(disponibles : .*email/);
});

test('le canal Slack existe sans avoir modifié channels.js', () => {
  const slack = createChannel('slack', { username: 'logistique' });
  const receipt = slack.send(MESSAGE);

  assert.equal(receipt.channel, 'slack');
  assert.equal(receipt.username, 'logistique');
  assert.equal(receipt.text, '*Devis transport*\nColis 1.2 kg');
  assert.ok(availableChannels().includes('slack'));
});

test('registerChannel ajoute (et retire) un canal à la volée', () => {
  class FaxChannel extends Channel {
    constructor() {
      super('fax');
    }
    send(message) {
      return { channel: this.name, body: message.body };
    }
  }

  const unregister = registerChannel('fax', () => new FaxChannel());
  assert.deepEqual(createChannel('fax').send(MESSAGE), { channel: 'fax', body: 'Colis 1.2 kg' });

  unregister();
  assert.throws(() => createChannel('fax'), /Canal inconnu/);
});

// --- Adapters ---------------------------------------------------------------

test('ColissimoAdapter : grammes et centimes convertis vers kg/euros', async () => {
  assert.deepEqual(await new ColissimoAdapter().quote(ORDER), {
    carrier: 'colissimo',
    priceEur: 7.95, // 495 + 1200 g × 0,25 = 795 centimes
    transitDays: 2,
  });
});

test('DhlAdapter : montant texte et appel asynchrone normalisés', async () => {
  assert.deepEqual(await new DhlAdapter().quote(ORDER), {
    carrier: 'dhl',
    priceEur: 9.8, // "9.80" -> 9.8
    transitDays: 1,
  });
});

test('DhlAdapter laisse remonter le 503 de l’API', async () => {
  const adapter = new DhlAdapter({ client: new DhlClient({ failFirst: 1 }) });
  await assert.rejects(() => adapter.quote(ORDER), /503/);
});

test('ColissimoAdapter laisse remonter une erreur de l’API', async () => {
  await assert.rejects(() => new ColissimoAdapter().quote({ weightKg: 1, zip: '7501' }), /Code postal invalide/);
});

// --- Décorateurs ------------------------------------------------------------

test('RetryQuote réessaie et finit par réussir', async () => {
  const client = new DhlClient({ failFirst: 1 });
  const quote = new RetryQuote(new DhlAdapter({ client }), { attempts: 3 });

  assert.deepEqual(await quote.quote(ORDER), { carrier: 'dhl', priceEur: 9.8, transitDays: 1 });
  assert.equal(client.calls, 2);
});

test('RetryQuote abandonne après le nombre de tentatives prévu', async () => {
  const quote = new RetryQuote(new DhlAdapter({ client: new DhlClient({ failFirst: 5 }) }), { attempts: 2 });
  await assert.rejects(() => quote.quote(ORDER), /indisponible après 2 tentative\(s\) : 503/);
});

test('CachedQuote ne rappelle l’API qu’une fois par commande', async () => {
  let calls = 0;
  const inner = {
    name: 'fake',
    quote: async () => {
      calls++;
      return { carrier: 'fake', priceEur: 1, transitDays: 1 };
    },
  };
  const quote = new CachedQuote(inner);

  await quote.quote(ORDER);
  await quote.quote({ ...ORDER });
  await quote.quote({ weightKg: 2, zip: '75011' });

  assert.equal(calls, 2); // même poids+CP = 1 appel, nouveau poids = 1 de plus
});

test('CachedQuote ne mémorise pas un échec', async () => {
  let calls = 0;
  const inner = {
    name: 'boom',
    quote: async () => {
      calls++;
      throw new Error('boom');
    },
  };
  const quote = new CachedQuote(inner);

  await assert.rejects(() => quote.quote(ORDER), /boom/);
  await assert.rejects(() => quote.quote(ORDER), /boom/);
  assert.equal(calls, 2);
});

test('l’ordre des décorateurs compte : cache à l’extérieur du retry', async () => {
  const client = new DhlClient({ failFirst: 1 });
  const quote = new CachedQuote(new RetryQuote(new DhlAdapter({ client }), { attempts: 3 }));

  await quote.quote(ORDER); // 1 échec + 1 succès
  await quote.quote(ORDER); // servi par le cache

  assert.equal(client.calls, 2);
  assert.equal(quote.size, 1);
});

// --- Façade -----------------------------------------------------------------

function buildService() {
  return new ShippingService({
    quoters: [
      new ColissimoAdapter(),
      new RetryQuote(new DhlAdapter({ client: new DhlClient({ failFirst: 1 }) }), { attempts: 3 }),
    ],
  });
}

test('ShippingService classe les devis et choisit le moins cher / le plus rapide', async () => {
  const service = buildService();

  assert.deepEqual(await service.best(ORDER), {
    carrier: 'colissimo',
    priceEur: 7.95,
    transitDays: 2,
  });
  assert.equal((await service.fastest(ORDER)).carrier, 'dhl');
  assert.deepEqual((await service.available(ORDER)).map((q) => q.carrier), ['colissimo', 'dhl']);
});

test('un transporteur en échec ne fait pas tomber les autres', async () => {
  const service = new ShippingService({
    quoters: [
      { name: 'buggy', quote: async () => { throw new Error('boum'); } },
      new ColissimoAdapter(),
    ],
  });

  const quotes = await service.quotes(ORDER);
  assert.equal(quotes[0].error, 'boum');
  assert.equal(quotes[1].carrier, 'colissimo');
  assert.equal((await service.best(ORDER)).carrier, 'colissimo');
});

test('ShippingService valide la commande avant d’appeler les transporteurs', async () => {
  const service = buildService();
  await assert.rejects(() => service.quotes({ weightKg: 0, zip: '75011' }), /Poids invalide/);
  await assert.rejects(() => service.quotes({ weightKg: 1, zip: '75' }), /Code postal invalide/);
});
