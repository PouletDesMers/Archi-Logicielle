export class SmtpMailer {
  constructor({ host, port, user, password }) {
    this.smtp = { host, port, user, password };
    this.outbox = [];
  }

  send({ to, subject, body }) {
    this.outbox.push({
      via: `${this.smtp.host}:${this.smtp.port}`,
      to,
      subject,
      body,
    });
  }
}
