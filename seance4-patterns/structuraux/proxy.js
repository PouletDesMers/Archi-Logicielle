// Proxy : contrôler l'accès à un objet (validation, chargement paresseux, droits).

// 1) Proxy de VALIDATION avec l'objet natif Proxy (ES2015)
const user = new Proxy(
  {},
  {
    set(target, prop, value) {
      if (prop === 'age' && (!Number.isInteger(value) || value < 0))
        throw new TypeError('age : entier positif attendu');
      target[prop] = value;
      return true;
    },
  },
);
user.age = 30;
try {
  user.age = -5;
} catch (e) {
  console.log('1) validation :', e.message, '| age conservé =', user.age);
}

// 2) Proxy VIRTUEL : l'objet coûteux n'est créé qu'au premier usage
class HeavyImage {
  constructor(src) {
    console.log(`   (chargement coûteux de ${src}…)`);
    this.src = src;
  }
  display() {
    return `affichage de ${this.src}`;
  }
}
class ImageProxy {
  #real = null;
  constructor(src) {
    this.src = src;
  }
  display() {
    this.#real ??= new HeavyImage(this.src);
    return this.#real.display();
  }
}
console.log('2) proxy virtuel : galerie créée, aucune image chargée');
const gallery = [new ImageProxy('photo1.jpg'), new ImageProxy('photo2.jpg')];
console.log('  ', gallery[0].display());
console.log('  ', gallery[0].display(), '(pas de second chargement)');

// 3) Proxy de PROTECTION : contrôle des droits
const makeGuarded = (service, role) =>
  new Proxy(service, {
    get(target, prop) {
      if (prop === 'deleteAll' && role !== 'admin')
        return () => {
          throw new Error(`accès refusé au rôle « ${role} »`);
        };
      return target[prop];
    },
  });
const orders = { list: () => ['CMD-1', 'CMD-2'], deleteAll: () => 'tout supprimé' };
const asUser = makeGuarded(orders, 'user');
console.log('3) protection :', asUser.list().join(', '));
try {
  asUser.deleteAll();
} catch (e) {
  console.log('   ✗', e.message);
}
console.log('   admin :', makeGuarded(orders, 'admin').deleteAll());
