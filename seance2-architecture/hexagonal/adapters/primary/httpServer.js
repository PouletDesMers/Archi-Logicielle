// ADAPTATEUR PRIMAIRE (pilote) : HTTP -> cas d'utilisation.
// node:http évite toute dépendance ; avec Express, le principe est identique.
import http from 'node:http';

export function createHttpServer({ placeOrder, orderRepository }) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body, null, 2));
    };
    try {
      if (req.method === 'POST' && req.url === '/orders') {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const order = await placeOrder.handle(JSON.parse(raw || '{}'));
        return send(201, order);
      }
      const m = req.url.match(/^\/orders\/([\w-]+)$/);
      if (req.method === 'GET' && m) {
        const order = await orderRepository.findById(m[1]);
        return order ? send(200, order) : send(404, { error: 'Commande introuvable' });
      }
      send(404, { error: 'Route inconnue. Essayez POST /orders ou GET /orders/:id' });
    } catch (e) {
      send(400, { error: e.message });
    }
  });
}
