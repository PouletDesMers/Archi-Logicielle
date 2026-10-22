import { ColissimoAdapter, DhlAdapter } from './shipping/adapters.js';
import { RetryQuote, CachedQuote } from './shipping/decorators.js';
import { ShippingService } from './shipping/ShippingService.js';
import { DhlClient } from '../tp4/carrierApis.js';

const shipping = new ShippingService([
  new CachedQuote(new ColissimoAdapter()),
  new CachedQuote(new RetryQuote(new DhlAdapter(new DhlClient({ failFirst: 1 })))),
]);

for (const weightKg of [2, 10]) {
  const best = await shipping.bestQuote({ weightKg, zip: '75011' });
  console.log(
    `[EMAIL → alice@exemple.fr] Bonjour Alice, votre colis de ${weightKg} kg part avec ${best.carrier} (${best.price.toFixed(2)} €).`,
  );
}
console.log('[SLACK #logistique] Tarifs mis à jour');
