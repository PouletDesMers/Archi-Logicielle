// COMPOSITION ROOT partagée : câble les adaptateurs sur les ports.
import { PlaceOrder } from './application/PlaceOrder.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';
import { ConsoleNotifier } from './adapters/secondary/ConsoleNotifier.js';

export function buildApp() {
  const orderRepository = new InMemoryOrderRepository();
  let n = 0;
  const placeOrder = new PlaceOrder({
    orderRepository,
    catalog: new StaticCatalog(),
    notifier: new ConsoleNotifier(),
    clock: { now: () => new Date().toISOString() },
    ids: { next: () => `CMD-${String(++n).padStart(4, '0')}` },
  });
  return { placeOrder, orderRepository };
}
