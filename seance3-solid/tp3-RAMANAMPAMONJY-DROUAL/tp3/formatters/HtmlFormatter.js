export class HtmlFormatter {
  format(stats) {
    let output = `<h1>Ventes ${stats.month}</h1><p>${stats.count} commande(s), panier moyen ${stats.average} €</p><ul>`;
    for (const category of Object.keys(stats.byCategory).sort()) {
      output += `<li>${category} : ${stats.byCategory[category]} €</li>`;
    }
    return output + `</ul><p><b>Total TTC : ${stats.revenueTTC} €</b></p>`;
  }
}
