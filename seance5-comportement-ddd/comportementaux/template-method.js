// Template Method : le squelette de l'algorithme est fixé dans la classe parente,
// les sous-classes redéfinissent seulement certaines étapes.
const DATA = [
  { id: 1, client: 'Alice', total: 98, active: true },
  { id: 2, client: 'Bob', total: 19, active: false },
  null,
  { id: 3, client: 'Chloé', total: 45, active: true },
];

class DataExporter {
  // MÉTHODE TEMPLATE : ordre des étapes figé
  async export(source) {
    const rows = await this.fetch(source);
    const valid = rows.filter(r => this.isValid(r));
    const output = this.format(valid);
    return this.write(output);
  }
  // étapes abstraites
  async fetch() {
    throw new Error('fetch() à implémenter');
  }
  format() {
    throw new Error('format() à implémenter');
  }
  // « hooks » avec comportement par défaut
  isValid(row) {
    return row != null;
  }
  write(out) {
    return out;
  }
}

class CsvExporter extends DataExporter {
  async fetch() {
    return DATA;
  }
  format(rows) {
    const keys = Object.keys(rows[0] ?? {});
    return [keys.join(';'), ...rows.map(r => keys.map(k => r[k]).join(';'))].join('\n');
  }
}
class JsonExporter extends DataExporter {
  async fetch() {
    return DATA;
  }
  isValid(row) {
    return row?.active === true;
  } // hook redéfini
  format(rows) {
    return JSON.stringify(rows.map(({ id, client }) => ({ id, client })));
  }
  write(out) {
    return `/* export du ${new Date().toISOString().slice(0, 10)} */ ${out}`;
  }
}

console.log(
  'CSV (toutes les lignes non nulles) :\n' + (await new CsvExporter().export()),
);
console.log(
  'JSON (clients actifs uniquement) :\n' + (await new JsonExporter().export()),
);
