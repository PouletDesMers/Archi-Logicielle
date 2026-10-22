export class FreeReportPolicy {
  assertAllowed({ format, recipient }) {
    if (format !== 'csv') throw new Error('Format réservé aux comptes Pro');
    if (recipient) throw new Error('Envoi par e-mail réservé aux comptes Pro');
  }
}
