// Composition root et démarrage de l'API HTTP.
import { PlaceOrder } from './application/PlaceOrder.js';
import { createHttpServer } from './adapters/primary/httpServer.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';
import { ConsoleNotifier } from './adapters/secondary/ConsoleNotifier.js';

const orderRepository = new InMemoryOrderRepository();
let sequence = 0;
const placeOrder = new PlaceOrder({
  orderRepository,
  catalog: new StaticCatalog(),
  payment: new FakePayment(),
  notifier: new ConsoleNotifier(),
  clock: { now: () => new Date().toISOString() },
  ids: { next: () => `CMD-${String(++sequence).padStart(4, '0')}` },
});

const PORT = Number(process.env.PORT) || 3001;
createHttpServer({ placeOrder, orderRepository }).listen(PORT, () => {
  console.log(`API ShopLite sur http://localhost:${PORT}  (Ctrl+C pour arrêter)`);
  console.log(
    'Test : POST /orders  {"customerId":"C-42","items":[{"sku":"CLAVIER","qty":2}]}',
  );
});
