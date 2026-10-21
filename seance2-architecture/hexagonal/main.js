// Démarre l'API HTTP (adaptateur primaire n°1).
import { buildApp } from './container.js';
import { createHttpServer } from './adapters/primary/httpServer.js';

const PORT = Number(process.env.PORT) || 3000;
createHttpServer(buildApp()).listen(PORT, () => {
  console.log(`API ShopLite sur http://localhost:${PORT}  (Ctrl+C pour arrêter)`);
  console.log(
    'Test : POST /orders  {"customerId":"C-42","items":[{"sku":"CLAVIER","qty":2}]}',
  );
});
