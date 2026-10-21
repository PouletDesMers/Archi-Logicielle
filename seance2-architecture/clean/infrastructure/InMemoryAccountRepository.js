// ADAPTATEUR d'infrastructure : implémente le port en mémoire.
// On pourrait écrire PostgresAccountRepository avec la même interface.
import { Account } from '../domain/Account.js';

export class InMemoryAccountRepository {
  #rows = new Map();
  constructor(seed = []) {
    seed.forEach(a => this.#rows.set(a.id, { ...a }));
  }

  async findById(id) {
    const row = this.#rows.get(id);
    if (!row) throw new Error(`Compte inconnu : ${id}`);
    return new Account(row.id, row.owner, row.balance); // mapping ligne -> entité
  }
  async saveAll(accounts) {
    accounts.forEach(a =>
      this.#rows.set(a.id, { id: a.id, owner: a.owner, balance: a.balance }),
    );
  }
}
