// Adapter : faire collaborer des interfaces incompatibles.

// Deux prestataires de paiement (simulés) aux API différentes et non modifiables
class LegacyPayGateway {
  // montants en centimes, réponse synchrone
  makePayment(amountInCents, cardNumber) {
    return cardNumber.startsWith('4')
      ? { status: 'OK', ref: `LG-${amountInCents}` }
      : { status: 'KO' };
  }
}
class ModernPspClient {
  // style « Stripe » : async, objet d'options
  async createCharge({ amount, currency, source }) {
    return { id: `ch_${amount}${currency}`, paid: source !== '0000' };
  }
}

// Contrat attendu par NOTRE application (le port) :
//   pay({ amount: euros, card }) -> Promise<{ success: boolean, id?: string }>
class LegacyPayAdapter {
  constructor(legacy) {
    this.legacy = legacy;
  }
  async pay({ amount, card }) {
    const r = this.legacy.makePayment(Math.round(amount * 100), card); // traduction
    return { success: r.status === 'OK', id: r.ref };
  }
}
class ModernPspAdapter {
  constructor(client) {
    this.client = client;
  }
  async pay({ amount, card }) {
    const r = await this.client.createCharge({
      amount: Math.round(amount * 100),
      currency: 'eur',
      source: card,
    });
    return { success: r.paid, id: r.id };
  }
}

// Code métier : il ignore quel prestataire est utilisé
async function checkout(paymentPort, amount, card) {
  const r = await paymentPort.pay({ amount, card });
  return r.success ? `payé (${r.id})` : 'refusé';
}

for (const [name, port] of [
  ['Legacy', new LegacyPayAdapter(new LegacyPayGateway())],
  ['Moderne', new ModernPspAdapter(new ModernPspClient())],
]) {
  const ok = await checkout(port, 49.9, '4242');
  const ko = await checkout(port, 10, '0000');
  console.log(`${name.padEnd(8)} → 49,90 € : ${ok} | carte 0000 : ${ko}`);
}
