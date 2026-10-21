// CAS D'UTILISATION : orchestre les entités.
// Il dépend d'un PORT (accountRepository), jamais d'une base de données concrète.
//
// Contrat attendu du port (duck typing, documenté en JSDoc) :
/** @typedef {import('../domain/Account.js').Account} Account */
/**
 * @typedef {Object} AccountRepository
 * @property {(id: string) => Promise<Account>} findById
 * @property {(accounts: Account[]) => Promise<void>} saveAll
 */
export class TransferMoney {
  /** @param {AccountRepository} accountRepository */
  constructor(accountRepository) {
    this.accounts = accountRepository;
  }

  async execute({ fromId, toId, amount }) {
    if (fromId === toId) throw new Error('Comptes source et destination identiques');
    const from = await this.accounts.findById(fromId);
    const to = await this.accounts.findById(toId);
    from.withdraw(amount); // les règles métier sont dans l'entité
    to.deposit(amount);
    await this.accounts.saveAll([from, to]);
    return { fromBalance: from.balance, toBalance: to.balance };
  }
}
