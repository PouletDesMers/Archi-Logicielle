// COMPOSITION ROOT : seul endroit qui connaît les classes concrètes.
import { Container } from './Container.js';

// --- classes métier / infrastructure (normalement dans leurs propres fichiers) ---
class InMemoryUserRepository {
  #users = [];
  async add(user) {
    this.#users.push(user);
  }
  async existsByEmail(email) {
    return this.#users.some(u => u.email === email);
  }
  async count() {
    return this.#users.length;
  }
}
class ConsoleMailer {
  constructor(config) {
    this.from = config.mailFrom;
  }
  async send(to, subject) {
    console.log(`  [mail] de ${this.from} à ${to} : ${subject}`);
  }
}
class RegisterUser {
  // cas d'utilisation
  constructor(userRepo, mailer) {
    this.users = userRepo;
    this.mailer = mailer;
  }
  async execute({ email }) {
    if (await this.users.existsByEmail(email)) throw new Error(`${email} existe déjà`);
    await this.users.add({ email });
    await this.mailer.send(email, 'Bienvenue sur ShopLite');
  }
}

// --- câblage ---
const c = new Container()
  .register('config', () => ({ mailFrom: 'noreply@shoplite.fr' }), { singleton: true })
  .register('userRepo', () => new InMemoryUserRepository(), { singleton: true })
  .register('mailer', ({ resolve }) => new ConsoleMailer(resolve('config')), {
    singleton: true,
  })
  .register(
    'registerUser',
    ({ resolve }) => new RegisterUser(resolve('userRepo'), resolve('mailer')),
  );

const register = c.resolve('registerUser');
await register.execute({ email: 'alice@ecole.fr' });
await register.execute({ email: 'bob@ecole.fr' });
try {
  await register.execute({ email: 'alice@ecole.fr' });
} catch (e) {
  console.log('  ✗', e.message);
}
console.log('  Utilisateurs inscrits :', await c.resolve('userRepo').count());
console.log(
  '  userRepo est un singleton :',
  c.resolve('userRepo') === c.resolve('userRepo'),
);
console.log(
  '  registerUser est transitoire :',
  c.resolve('registerUser') !== c.resolve('registerUser'),
);
