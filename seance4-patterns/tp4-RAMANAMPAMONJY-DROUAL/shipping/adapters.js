import { ColissimoApi, DhlClient } from '../../tp4/carrierApis.js';

export class ColissimoAdapter {
  constructor(api = new ColissimoApi()) {
    this.api = api?.tarif ? api : api?.api ?? new ColissimoApi();
  }

  async getQuote({ weightKg, zip }) {
    const { prixCentimes, delaiJours } = this.api.tarif({
      poidsGrammes: Math.round(weightKg * 1000),
      codePostal: zip,
    });
    return Object.freeze({
      carrier: 'Colissimo',
      price: Math.round(prixCentimes) / 100,
      days: delaiJours,
    });
  }

  async quote(parcel) {
    const quote = await this.getQuote(parcel);
    return {
      carrier: quote.carrier.toLowerCase(),
      priceEur: quote.price,
      transitDays: quote.days,
    };
  }

  get name() { return 'colissimo'; }
}

export class DhlAdapter {
  constructor(client = new DhlClient()) {
    this.client = client?.getRate ? client : client?.client ?? new DhlClient();
  }

  async getQuote({ weightKg, zip }) {
    const rate = await this.client.getRate(weightKg, zip);
    return Object.freeze({
      carrier: 'DHL',
      price: Number(rate.amount),
      days: rate.transitDays,
    });
  }

  async quote(parcel) {
    const quote = await this.getQuote(parcel);
    return {
      carrier: quote.carrier.toLowerCase(),
      priceEur: quote.price,
      transitDays: quote.days,
    };
  }

  get name() { return 'dhl'; }
}
