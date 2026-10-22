// Adapters : l'API des transporteurs est FOURNIE et NON MODIFIABLE.
// On ne l'appelle jamais directement dans le métier : on la traduit vers
// notre propre contrat de devis :
//
//   quote(order) -> Promise<{ carrier, priceEur, transitDays }>
//   order = { weightKg, zip }
//
// Différences absorbées ici : unités (kg <-> g), monnaie (centimes <-> euros),
// type (Number vs string), synchrone vs asynchrone, nom des paramètres.
import { ColissimoApi, DhlClient } from '../../tp4/carrierApis.js';

export class ColissimoAdapter {
  constructor({ api = new ColissimoApi() } = {}) {
    this.api = api;
  }

  get name() {
    return 'colissimo';
  }

  async quote({ weightKg, zip }) {
    // kg -> grammes, et `zip` -> `codePostal` (l'API parle une autre langue).
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
    // L'API est asynchrone et renvoie un montant en texte ("9.80").
    const rate = await this.client.getRate(weightKg, zip);
    return {
      carrier: this.name,
      priceEur: Math.round(Number(rate.amount) * 100) / 100,
      transitDays: rate.transitDays,
    };
  }
}
