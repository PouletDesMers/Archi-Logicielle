import { ReportService } from './ReportService.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { JsonFileOrderRepository } from './infrastructure/JsonFileOrderRepository.js';
import { SmtpMailer } from './infrastructure/SmtpMailer.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

export function buildReportService({ policy } = {}) {
  const formatters = new FormatterRegistry()
    .register('csv', new CsvFormatter())
    .register('html', new HtmlFormatter())
    .register('json', new JsonFormatter());
  const orders = new JsonFileOrderRepository(new URL('./orders.json', import.meta.url));
  const mailer = new SmtpMailer({
    host: process.env.SMTP_HOST || 'smtp.shoplite.fr',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || 'reports',
    password: process.env.SMTP_PASSWORD || '',
  });
  return new ReportService({
    orders,
    formatters,
    mailer,
    logger: new ConsoleLogger(),
    policy,
  });
}
