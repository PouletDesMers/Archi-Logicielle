import { ColissimoApi, DhlClient } from '../../tp4/carrierApis.js';

export class ColissimoAdapter {
  constructor({ api = new ColissimoApi() } = {}) {
    this.api = api;
  }

  get name() {
    return 'colissimo';
  }

  async quote({ weightKg, zip }) {
    const poidsGrammes = Math.round(weightKg * 1000);
    const { prixCentimes, delaiJours } = this.api.tarif({ poidsGrammes, codePostal: zip });
    return {
      carrier: this.name,
      priceEur: Math.round(prixCentimes) / 100,
      transitDays: delaiJours,
    };
  }
}

export class DhlAdapter {
  constructor({ client = new DhlClient() } = {}) {
    this.client = client;
  }

  get name() {
    return 'dhl';
  }

  async quote({ weightKg, zip }) {
    const rate = await this.client.getRate(weightKg, zip);
    return {
      carrier: this.name,
      priceEur: Math.round(Number(rate.amount) * 100) / 100,
      transitDays: rate.transitDays,
    };
  }
}
