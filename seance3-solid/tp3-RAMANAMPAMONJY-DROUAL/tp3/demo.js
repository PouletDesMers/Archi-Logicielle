// Démonstration du code de départ : node seance3-solid/tp3/demo.js
import { buildReportService } from './main.js';
const service = buildReportService();
console.log(service.generate('2026-09', 'csv'));
console.log(service.generate('2026-09', 'html', 'direction@shoplite.fr'));
console.log('E-mails envoyés :', service.mailer.outbox.length);
