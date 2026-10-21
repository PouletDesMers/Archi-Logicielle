// D – Dependency Inversion Principle : dépendre d'abstractions, pas de détails.

// ── AVANT : le service crée lui-même sa base de données ───────────────────
class MySQLDatabase {
  query() {
    throw new Error('Connexion MySQL impossible (pas de serveur ici)');
  }
}
class UserServiceBefore {
  constructor() {
    this.db = new MySQLDatabase();
  } // couplage fort
  getUser(id) {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}
console.log('AVANT :');
try {
  new UserServiceBefore().getUser(1);
} catch (e) {
  console.log('  ✗', e.message, '→ impossible à tester sans MySQL');
}

// ── APRÈS : le service reçoit une abstraction (un « repository ») ─────────
class UserService {
  constructor(userRepository) {
    this.users = userRepository;
  } // injection
  async greet(id) {
    const user = await this.users.findById(id);
    return user ? `Bonjour ${user.name}` : 'Utilisateur inconnu';
  }
}
// Deux implémentations interchangeables de la même abstraction :
class InMemoryUserRepository {
  #data = new Map([
    [1, { id: 1, name: 'Alice' }],
    [2, { id: 2, name: 'Bob' }],
  ]);
  async findById(id) {
    return this.#data.get(id);
  }
}
class JsonUserRepository {
  constructor(json) {
    this.users = JSON.parse(json);
  }
  async findById(id) {
    return this.users.find(u => u.id === id);
  }
}
console.log('APRÈS :');
console.log('  ' + (await new UserService(new InMemoryUserRepository()).greet(1)));
console.log(
  '  ' +
    (await new UserService(new JsonUserRepository('[{"id":1,"name":"Chloé"}]')).greet(
      1,
    )),
);
