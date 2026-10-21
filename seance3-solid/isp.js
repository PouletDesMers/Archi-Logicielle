// I – Interface Segregation Principle : pas de méthodes imposées inutilement.

// ── AVANT : une interface « grasse » ──────────────────────────────────────
class Machine {
  print() {}
  scan() {}
  fax() {}
}
class OldPrinter extends Machine {
  print(doc) {
    return `imprime ${doc}`;
  }
  scan() {
    throw new Error('Non supporté');
  }
  fax() {
    throw new Error('Non supporté');
  }
}
console.log('AVANT :');
const p = new OldPrinter();
console.log('  ' + p.print('cours.pdf'));
try {
  p.scan('photo');
} catch (e) {
  console.log('  ✗ scan :', e.message, '(méthode imposée mais inutilisable)');
}

// ── APRÈS : de petits rôles composables (mixins) ─────────────────────────
const Printer = Base =>
  class extends Base {
    print(doc) {
      return `imprime ${doc}`;
    }
  };
const Scanner = Base =>
  class extends Base {
    scan(doc) {
      return `numérise ${doc}`;
    }
  };
const Fax = Base =>
  class extends Base {
    fax(doc) {
      return `faxe ${doc}`;
    }
  };

class SimplePrinter extends Printer(Object) {}
class OfficeMachine extends Fax(Scanner(Printer(Object))) {}

// printAll ne dépend que de print()
const printAll = (printer, docs) => docs.map(d => printer.print(d));
console.log('APRÈS :');
console.log('  ' + printAll(new SimplePrinter(), ['a.pdf', 'b.pdf']).join(', '));
const office = new OfficeMachine();
console.log('  ' + [office.print('x'), office.scan('y'), office.fax('z')].join(', '));
console.log('  SimplePrinter possède scan() ?', 'scan' in new SimplePrinter());
