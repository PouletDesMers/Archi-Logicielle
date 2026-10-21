// Iterator : parcourir une collection sans exposer sa structure interne.
// Il est intégré au langage : Symbol.iterator, générateurs, for...of.
class Playlist {
  #songs = [];
  add(...titles) {
    this.#songs.push(...titles);
    return this;
  }
  *[Symbol.iterator]() {
    yield* this.#songs;
  } // parcours par défaut
  *reversed() {
    for (let i = this.#songs.length - 1; i >= 0; i--) yield this.#songs[i];
  }
  *shuffled(seed = 7) {
    // aléatoire reproductible
    const copy = [...this.#songs];
    while (copy.length) {
      seed = (seed * 9301 + 49297) % 233280;
      yield copy.splice(seed % copy.length, 1)[0];
    }
  }
}
const p = new Playlist().add('Intro', 'Couplet', 'Refrain', 'Pont', 'Final');
console.log('for...of   :', [...p].join(' → '));
console.log('inversé    :', [...p.reversed()].join(' → '));
console.log('mélangé    :', [...p.shuffled()].join(' → '));
const [first, second] = p;
console.log('déstructuration :', first, '/', second);

// Itérateur ASYNCHRONE et PARESSEUX : pagination d'une API (simulée)
const fakeApi = page =>
  new Promise(r =>
    setTimeout(
      () =>
        r({
          items: [`produit-${page * 2 - 1}`, `produit-${page * 2}`],
          nextPage: page < 3 ? page + 1 : null,
        }),
      30,
    ),
  );

async function* allProducts() {
  for (let page = 1; page;) {
    console.log(`   (chargement de la page ${page})`);
    const res = await fakeApi(page);
    yield* res.items;
    page = res.nextPage;
  }
}
console.log('Pagination paresseuse :');
for await (const product of allProducts()) {
  console.log('  ', product);
  if (product === 'produit-3') {
    console.log('   arrêt anticipé : la page 3 n’est jamais chargée');
    break;
  }
}
