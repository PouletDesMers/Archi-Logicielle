// ADAPTATEUR SECONDAIRE : paiement simulé avec une limite métier externe.
export class FakePayment {
  async pay(order) {
    if (order.total > 500) throw new Error('Paiement refusé au-delà de 500 €');
  }
}
