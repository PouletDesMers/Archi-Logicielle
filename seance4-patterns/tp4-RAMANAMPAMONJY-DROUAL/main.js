import { createChannel, availableChannels } from './notifications/channels.js';
import './notifications/slack.js';
import { MessageBuilder } from './notifications/MessageBuilder.js';
import { ColissimoAdapter, DhlAdapter } from './shipping/adapters.js';
import { RetryQuote, CachedQuote } from './shipping/decorators.js';
import { ShippingService } from './shipping/ShippingService.js';
import { DhlClient } from '../tp4/carrierApis.js';

const order = { weightKg: 1.2, zip: '75011' };

const shipping = new ShippingService({
  quoters: [
    new CachedQuote(new ColissimoAdapter()),
    new CachedQuote(
      new RetryQuote(new DhlAdapter({ client: new DhlClient({ failFirst: 1 }) }), {
        attempts: 3,
        onRetry: ({ attempt, error }) =>
          console.log(`  DHL tentative ${attempt} échouée : ${error.message}`),
      }),
    ),
  ],
});

console.log('Transporteurs :', shipping.carriers.join(', '));
console.table(await shipping.quotes(order));

const best = await shipping.best(order);
const fastest = await shipping.fastest(order);
console.log(`Moins cher : ${best.carrier} — ${best.priceEur.toFixed(2)} € (${best.transitDays} j)`);
console.log(`Plus rapide : ${fastest.carrier} — ${fastest.priceEur.toFixed(2)} € (${fastest.transitDays} j)`);

const message = new MessageBuilder()
  .to('logistique@shoplite.fr')
  .template('Devis transport {{zip}} : colis de {{poids}} kg. Meilleure offre : {{transporteur}} à {{prix}} € ({{delai}} j).')
  .with('zip', order.zip)
  .with('poids', order.weightKg)
  .with('transporteur', best.carrier)
  .with('prix', best.priceEur.toFixed(2))
  .with('delai', best.transitDays)
  .priority('haute')
  .build();

const email = createChannel('email');
const sms = createChannel('sms');
const slack = createChannel('slack');

console.log('\nCanaux disponibles :', availableChannels().join(', '));
console.log(email.send({ ...message, to: 'logistique@shoplite.fr' }));
console.log(sms.send({ ...message, to: '+33600000000' }));
console.log(slack.send({ ...message, to: 'transport' }));
console.log(sms.send({ to: '+33600000000', body: 'x'.repeat(200), priority: 'basse' }).slice(-20));

await shipping.quotes(order);
console.log('\nDevis mis en cache :', shipping.carriers.length, 'transporteur(s) servis sans appel réseau.');
