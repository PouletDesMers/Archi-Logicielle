// Petit serveur de fichiers statiques (sans dépendance) pour les exemples navigateur.
// Les modules ES (<script type="module">) ne fonctionnent pas en ouvrant un fichier
// directement (file://) : il faut passer par http://.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.md': 'text/plain',
};

const INDEX = `<!doctype html><meta charset="utf-8"><title>Exemples</title>
<body style="font-family:system-ui;max-width:640px;margin:40px auto">
<h1>Séance 1 – Patterns de présentation</h1>
<ul>
<li><a href="/seance1-presentation/mvc/">MVC – Todo-list</a></li>
<li><a href="/seance1-presentation/mvp/">MVP – Formulaire de connexion</a></li>
<li><a href="/seance1-presentation/mvvm/">MVVM – Panier réactif</a></li>
</ul></body>`;

http
  .createServer(async (req, res) => {
    try {
      const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(INDEX);
      }
      let file = path.join(ROOT, url);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Interdit');
      }
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type':
          (TYPES[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Introuvable');
    }
  })
  .listen(PORT, () =>
    console.log(
      `Exemples navigateur : http://localhost:${PORT}  (Ctrl+C pour arrêter)`,
    ),
  );
