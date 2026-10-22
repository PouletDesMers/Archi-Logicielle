// Composition et démonstration : node seance4-patterns/tp4-RAMANAMPAMONJY-DROUAL/main.js
import { createChannel, availableChannels } from './notifications/channels.js';
import './notifications/slack.js'; // import = enregistrement du canal « slack »
import { MessageBuilder } from './notifications/MessageBuilder.js';
import { ColissimoAdapter, DhlAdapter } from './shipping/adapters.js';
import { RetryQuote, CachedQuote } from './shipping/decorators.js';
import { ShippingService } from './shipping/ShippingService.js';
import { DhlClient } from '../tp4/carrierApis.js';

// --- 1. Composition des transporteurs ---------------------------------------
const order = { weightKg: 1.2, zip: '75011' };

const shipping = new ShippingService({
  quoters: [
    // Adapter nu : l'API Colissimo est synchrone et fiable.
    new CachedQuote(new ColissimoAdapter()),
    // Adapter + retry + cache : DHL tombe une fois (503) puis répond.
    new CachedQuote(
      new RetryQuote(new DhlAdapter({ client: new DhlClient({ failFirst: 1 }) }), {
        attempts: 3,
        onRetry: ({ attempt, error }) =>
          console.log(`  DHL tentative ${attempt} échouée : ${error.message}`),
      }),
    ),
  ],
});

// --- 2. Devis ---------------------------------------------------------------
console.log('Transporteurs :', shipping.carriers.join(', '));
console.table(await shipping.quotes(order));

const best = await shipping.best(order);
const fastest = await shipping.fastest(order);
console.log(`Moins cher : ${best.carrier} — ${best.priceEur.toFixed(2)} € (${best.transitDays} j)`);
console.log(`Plus rapide : ${fastest.carrier} — ${fastest.priceEur.toFixed(2)} € (${fastest.transitDays} j)`);

// --- 3. Message (builder) puis envoi (façade de canaux) ----------------------
const message = MessageBuilder.create()
  .subject(`Devis transport ${order.zip}`)
  .line(`Colis de ${order.weightKg} kg vers ${order.zip}.`)
  .line(`Meilleure offre : ${best.carrier} à ${best.priceEur.toFixed(2)} € (${best.transitDays} j).`)
  .priority('high')
  .build();

const email = createChannel('email');
const sms = createChannel('sms');
const slack = createChannel('slack', { username: 'logistique' });

console.log('\nCanaux disponibles :', availableChannels().join(', '));
console.log('EMAIL :', email.send({ ...message, to: 'logistique@shoplite.fr' }));
console.log('SMS   :', sms.send({ ...message, to: '+33600000000' }));
console.log('SLACK :\n' + slack.send(message).text);

// Deuxième devis identique : le cache répond sans rappeler les API.
await shipping.quotes(order);
console.log('\nDevis mis en cache :', shipping.carriers.length, 'transporteur(s) servis sans appel réseau.');
