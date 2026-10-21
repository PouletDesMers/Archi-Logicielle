// C · DATA — Adapter : deux sources de mesures hétérogènes, un seul contrat.
//
// Contrat attendu par le reste de QueenBee (contexte « Santé des colonies ») :
//   Mesure = { hiveId: string, at: string ISO 8601 (UTC), poidsKg: number, temperatureC: number, source: string }

// --- Source 1 : trames capteurs déjà décodées (format 6.5 du cahier des charges) — NON modifiable
export class CapteurLoRaSource {
  async trames() {
    return [
      { hive_id: 'SN-CASA-014', site_id: 'SN-CASA', timestamp: '2027-03-14T08:15:00Z', weight_kg: 34.2, temp_internal_c: 34.8 },
      { hive_id: 'SN-CASA-015', site_id: 'SN-CASA', timestamp: '2027-03-14T08:30:00Z', weight_kg: 29.9, temp_internal_c: 35.1 },
    ];
  }
}

// --- Source 2 : anciens relevés papier numérisés (CSV) — NON modifiable
// colonnes : ruche ; date « JJ/MM/AAAA HH:MM » (heure UTC) ; poids en GRAMMES ; température en °F
export class ReleveManuelSource {
  async lignes() {
    return [
      'CM-BAF-003;13/03/2027 07:00;41850;93.2',
      'CM-BAF-004;13/03/2027 07:20;;95.0', // poids manquant : ligne inexploitable
      'CM-BAF-005;14/03/2027 09:05;38100;94.1',
    ];
  }
}

// --- Adaptateurs : À VOUS
// TODO C-Data.1 : LoRaAdapter — renommer les champs vers le contrat Mesure (source: 'capteur')
export class LoRaAdapter {
  constructor(source) { this.source = source; }
  async mesures() {
    throw new Error('TODO C-Data.1');
  }
}

// TODO C-Data.2 : ReleveManuelAdapter — découper la ligne CSV, convertir
//   - la date « JJ/MM/AAAA HH:MM » (UTC) en ISO 8601 (indice : Date.UTC)
//   - les grammes en kilogrammes, les °F en °C arrondis au dixième : (F − 32) × 5 / 9
//   - ignorer les lignes incomplètes (qualité des données) ; source: 'releve-manuel'
export class ReleveManuelAdapter {
  constructor(source) { this.source = source; }
  async mesures() {
    throw new Error('TODO C-Data.2');
  }
}

// --- Client : ne connaît que le contrat Mesure (fourni)
export async function toutesLesMesures(adaptateurs) {
  const lots = await Promise.all(adaptateurs.map(a => a.mesures()));
  return lots.flat().sort((a, b) => a.at.localeCompare(b.at));
}
