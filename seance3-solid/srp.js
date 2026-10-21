// S – Single Responsibility Principle : une classe = une seule raison de changer.

// ── AVANT : la facture calcule, formate, enregistre ET envoie ─────────────
class InvoiceGodClass {
  constructor(lines) {
    this.lines = lines;
  }
  total() {
    return this.lines.reduce((s, l) => s + l.price * l.qty, 0);
  }
  toText() {
    return (
      this.lines.map(l => `${l.label} x${l.qty}`).join(', ') + ` = ${this.total()} €`
    );
  }
  saveToDB() {
    console.log('  [SQL] INSERT INTO invoices ...');
  }
  sendByEmail() {
    console.log('  [SMTP] envoi de la facture ...');
  }
}
console.log('AVANT (4 responsabilités dans une seule classe) :');
const god = new InvoiceGodClass([{ label: 'Clavier', price: 49, qty: 1 }]);
console.log('  ' + god.toText());
god.saveToDB();
god.sendByEmail();

// ── APRÈS : une classe par responsabilité (par « acteur » qui demande des changements) ─
class Invoice {
  // le comptable : règles de calcul
  constructor(lines) {
    this.lines = lines;
  }
  total() {
    return this.lines.reduce((s, l) => s + l.price * l.qty, 0);
  }
}
class InvoiceTextRenderer {
  // le service client : présentation
  render(inv) {
    return (
      inv.lines.map(l => `${l.label} x${l.qty}`).join(', ') + ` = ${inv.total()} €`
    );
  }
}
class InvoiceRepository {
  // l'équipe technique : persistance
  #rows = [];
  save(inv) {
    this.#rows.push(inv);
    console.log(`  [repo] ${this.#rows.length} facture(s) enregistrée(s)`);
  }
}
class InvoiceMailer {
  // le marketing : communication
  send(inv, to) {
    console.log(`  [mail] facture de ${inv.total()} € envoyée à ${to}`);
  }
}

console.log('APRÈS (4 classes, 1 responsabilité chacune) :');
const invoice = new Invoice([
  { label: 'Clavier', price: 49, qty: 1 },
  { label: 'Souris', price: 19, qty: 2 },
]);
console.log('  ' + new InvoiceTextRenderer().render(invoice));
new InvoiceRepository().save(invoice);
new InvoiceMailer().send(invoice, 'client@exemple.fr');
