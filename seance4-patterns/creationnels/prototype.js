// Prototype : créer de nouveaux objets en CLONANT un modèle existant.
class Report {
  constructor(title, sections, meta) {
    Object.assign(this, { title, sections, meta });
  }
  clone() {
    const copy = structuredClone(this); // copie profonde (données)
    return Object.setPrototypeOf(copy, Report.prototype); // on restaure les méthodes
  }
  summary() {
    const tags = this.meta.tags.join(', ');
    return `${this.title} [${tags}] – ${this.sections.length} sections`;
  }
}

const template = new Report(
  'Rapport mensuel',
  [
    { h: 'Synthèse', body: '' },
    { h: 'KPIs', body: '' },
  ],
  { author: 'Équipe data', tags: ['interne'] },
);

const september = template.clone();
september.title = 'Rapport – septembre';
september.meta.tags.push('Q3');
console.log('clone    :', september.summary());
console.log('original :', template.summary(), '← intact');

// Piège : la copie SUPERFICIELLE partage les objets imbriqués
const shallow = { ...template, meta: template.meta };
shallow.meta.tags.push('oups');
console.log('après copie superficielle, original :', template.meta.tags);

// En JS, le mécanisme d'héritage lui-même est prototypal :
const animal = {
  describe() {
    return `${this.name} fait « ${this.sound} »`;
  },
};
const cat = Object.create(animal, {
  name: { value: 'Chat' },
  sound: { value: 'miaou' },
});
console.log(
  cat.describe(),
  '| prototype = animal ?',
  Object.getPrototypeOf(cat) === animal,
);
