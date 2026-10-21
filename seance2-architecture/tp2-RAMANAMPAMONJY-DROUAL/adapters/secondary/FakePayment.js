// ADAPTATEUR SECONDAIRE : paiement simulé avec une limite métier externe.
export class FakePayment {
  async charge({ amount }) {
    if (amount > 500) {
      return { ok: false, reason: 'Paiement refusé : montant supérieur à 500 €' };
    }
    return { ok: true };
  }
}
