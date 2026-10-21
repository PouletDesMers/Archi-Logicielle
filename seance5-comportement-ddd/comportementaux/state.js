// State : l'objet change de comportement selon son état, sans switch sur un statut.
const Draft = {
  name: 'Brouillon',
  submit: a => a.setState(Review),
  publish: () => {
    throw new Error('une relecture est obligatoire avant publication');
  },
  reject: () => {
    throw new Error('rien à rejeter');
  },
};
const Review = {
  name: 'En relecture',
  submit: () => {
    throw new Error('déjà soumis');
  },
  publish: a => a.setState(Published),
  reject: a => a.setState(Draft),
};
const Published = {
  name: 'Publié',
  submit: () => {
    throw new Error('déjà publié');
  },
  publish: () => {
    throw new Error('déjà publié');
  },
  reject: () => {
    throw new Error('impossible de rejeter un article publié');
  },
};

class Article {
  #state = Draft;
  constructor(title) {
    this.title = title;
  }
  get status() {
    return this.#state.name;
  }
  setState(s) {
    console.log(`   ${this.#state.name} → ${s.name}`);
    this.#state = s;
  }
  submit() {
    this.#state.submit(this);
  }
  publish() {
    this.#state.publish(this);
  }
  reject() {
    this.#state.reject(this);
  }
}

const a = new Article('Les patterns en JS');
const act = name => {
  try {
    a[name]();
  } catch (e) {
    console.log(`   ✗ ${name}() refusé (${a.status}) : ${e.message}`);
  }
};
console.log(`« ${a.title} » – état initial : ${a.status}`);
['publish', 'submit', 'reject', 'submit', 'publish', 'submit'].forEach(act);
console.log('État final :', a.status);
