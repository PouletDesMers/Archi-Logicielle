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
const MESSAGE = { to: 'logistique@shoplite.fr', body: 'Colis 1.2 kg', priority: 'normal' };

test('MessageBuilder construit un message figé', () => {
  const message = MessageBuilder.create()
    .to('a@b.fr')
    .line('ligne 1')
    .line('  ligne 2  ')
    .priority('high')
    .build();

  assert.deepEqual(message, { to: 'a@b.fr', body: 'ligne 1\nligne 2', priority: 'high' });
  assert.ok(Object.isFrozen(message));
});

test('MessageBuilder refuse un message sans corps', () => {
  assert.throws(() => MessageBuilder.create().to('a@b.fr').build(), /corps manquant/);
});

test('MessageBuilder refuse une priorité inconnue', () => {
  assert.throws(() => MessageBuilder.create().priority('urgent'), /priorité inconnue/);
});

test('Channel.send() est une méthode abstraite', () => {
  assert.throws(() => new Channel().send(MESSAGE), /méthode abstraite/);
});

test('un canal par type renvoie le texte attendu', () => {
  assert.equal(createChannel('email').send(MESSAGE), '[EMAIL → logistique@shoplite.fr] Colis 1.2 kg');
  assert.equal(createChannel('sms').send(MESSAGE), '[SMS → logistique@shoplite.fr] Colis 1.2 kg');
  assert.equal(createChannel('push').send(MESSAGE), '[PUSH → logistique@shoplite.fr] Colis 1.2 kg');
});

test('le SMS est tronqué à 160 caractères', () => {
  const text = createChannel('sms').send({ to: '+33600000000', body: 'a'.repeat(200) });
  assert.equal(text, `[SMS → +33600000000] ${'a'.repeat(160)}`);
});

test('un type inconnu est refusé avec la liste des canaux', () => {
  assert.throws(() => createChannel('fax'), /Canal inconnu : fax \(disponibles : .*email/);
});

test('le canal Slack est disponible après import de slack.js', () => {
  assert.ok(availableChannels().includes('slack'));
  assert.equal(
    createChannel('slack').send({ ...MESSAGE, to: 'transport' }),
    '[SLACK #transport] Colis 1.2 kg',
  );
});

test('registerChannel ajoute un canal, le retire, et refuse une classe invalide', () => {
  class FaxChannel extends Channel {
    send({ to, body }) {
      return `[FAX → ${to}] ${body}`;
    }
  }

  const unregister = registerChannel('fax', FaxChannel);
  assert.equal(createChannel('fax').send(MESSAGE), '[FAX → logistique@shoplite.fr] Colis 1.2 kg');

  unregister();
  assert.throws(() => createChannel('fax'), /Canal inconnu/);

  assert.throws(() => registerChannel('x', class PasUnCanal {}), /héritant de Channel/);
  assert.throws(() => registerChannel('y', () => new Channel()), /héritant de Channel/);
});

test('ColissimoAdapter : grammes et centimes convertis vers kg/euros', async () => {
  assert.deepEqual(await new ColissimoAdapter().quote(ORDER), {
    carrier: 'colissimo',
    priceEur: 7.95,
    transitDays: 2,
  });
});

test('DhlAdapter : montant texte et appel asynchrone normalisés', async () => {
  assert.deepEqual(await new DhlAdapter().quote(ORDER), {
    carrier: 'dhl',
    priceEur: 9.8,
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

  assert.equal(calls, 2);
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

  await quote.quote(ORDER);
  await quote.quote(ORDER);

  assert.equal(client.calls, 2);
  assert.equal(quote.size, 1);
});

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
