// Composite : traiter uniformément une feuille et un groupe d'éléments.
class FileLeaf {
  constructor(name, sizeKb) {
    this.name = name;
    this.sizeKb = sizeKb;
  }
  getSize() {
    return this.sizeKb;
  }
  print(indent = '') {
    return `${indent}- ${this.name} (${this.sizeKb} Ko)`;
  }
  find(pred) {
    return pred(this) ? [this] : [];
  }
}
class Folder {
  #children = [];
  constructor(name) {
    this.name = name;
  }
  add(...nodes) {
    this.#children.push(...nodes);
    return this;
  }
  getSize() {
    return this.#children.reduce((sum, c) => sum + c.getSize(), 0);
  } // récursif
  print(indent = '') {
    return [
      `${indent}+ ${this.name}/ (${this.getSize()} Ko)`,
      ...this.#children.map(c => c.print(indent + '   ')),
    ].join('\n');
  }
  find(pred) {
    return this.#children.flatMap(c => c.find(pred));
  }
}

const project = new Folder('shoplite').add(
  new FileLeaf('package.json', 1),
  new Folder('src').add(
    new FileLeaf('main.js', 4),
    new Folder('domain').add(
      new FileLeaf('Order.js', 12),
      new FileLeaf('Customer.js', 8),
    ),
    new Folder('infrastructure').add(new FileLeaf('PgOrderRepository.js', 15)),
  ),
);
console.log(project.print());
console.log('Taille totale :', project.getSize(), 'Ko');
console.log(
  'Fichiers > 10 Ko :',
  project
    .find(n => n.getSize() > 10)
    .map(f => f.name)
    .join(', '),
);
