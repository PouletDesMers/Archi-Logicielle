// ENTITÉ du domaine : règles métier pures, AUCUN import externe.
export class InsufficientFundsError extends Error {}

export class Account {
  constructor(id, owner, balance = 0) {
    this.id = id;
    this.owner = owner;
    this.balance = balance;
  }
  withdraw(amount) {
    if (amount <= 0) throw new Error('Le montant doit être positif');
    if (amount > this.balance)
      throw new InsufficientFundsError(`Solde insuffisant sur ${this.id}`);
    this.balance -= amount;
  }
  deposit(amount) {
    if (amount <= 0) throw new Error('Le montant doit être positif');
    this.balance += amount;
  }
}
