import { computeStats } from './domain/salesStats.js';
import { isValidEmailAddress } from './domain/EmailAddress.js';

export class ReportService {
  constructor({ orders, formatters, mailer, logger, policy = {} }) {
    this.orders = orders;
    this.formatters = formatters;
    this.mailer = mailer;
    this.logger = logger;
    this.policy = policy;
    this.history = [];
  }

  generate(month, format, recipient) {
    this.policy.assertAllowed?.({ format, recipient });
    const stats = computeStats(this.orders.all(), month);
    const output = this.formatters.get(format).format(stats);
    const line = `[${new Date().toISOString()}] rapport ${month} (${format}) : ${stats.count} commande(s)`;
    this.logger.info(line);
    this.history.push(line);

    if (recipient) {
      if (!isValidEmailAddress(recipient)) throw new Error(`Adresse invalide : ${recipient}`);
      this.mailer.send({
        to: recipient,
        subject: `Rapport des ventes ${month}`,
        body: output,
      });
    }
    return output;
  }
}
