// L – Liskov Substitution Principle : un sous-type doit pouvoir remplacer son parent.

// ── AVANT : Penguin hérite de fly() mais ne peut pas le respecter ─────────
{
  class Bird {
    fly() {
      return 'vole';
    }
  }
  class Sparrow extends Bird {}
  class Penguin extends Bird {
    fly() {
      throw new Error('Un manchot ne vole pas !');
    }
  }

  console.log('AVANT :');
  for (const b of [new Sparrow(), new Penguin()]) {
    try {
      console.log(`  ${b.constructor.name} ${b.fly()}`);
    } catch (e) {
      console.log(`  ✗ ${b.constructor.name} casse le code client : ${e.message}`);
    }
  }
}

// ── APRÈS : la hiérarchie reflète les vraies capacités ────────────────────
{
  class Bird {
    eat() {
      return 'mange';
    }
  }
  class FlyingBird extends Bird {
    fly() {
      return 'vole';
    }
  }
  class Sparrow extends FlyingBird {}
  class Penguin extends Bird {
    swim() {
      return 'nage';
    }
  }

  const migrate = flyingBirds =>
    flyingBirds.map(b => `${b.constructor.name} ${b.fly()}`);
  console.log('APRÈS :');
  console.log('  ' + migrate([new Sparrow()]).join(', ')); // n'accepte que des FlyingBird
  console.log(
    '  ' +
      [new Sparrow(), new Penguin()]
        .map(b => `${b.constructor.name} ${b.eat()}`)
        .join(', '),
  );
}
