export class CsvFormatter {
  format(stats) {
    let output = 'categorie;montant_ht\n';
    for (const category of Object.keys(stats.byCategory).sort()) {
      output += `${category};${stats.byCategory[category]}\n`;
    }
    return output +
      `TOTAL HT;${stats.revenueHT}\nTVA;${stats.vat}\nTOTAL TTC;${stats.revenueTTC}\n`;
  }
}
