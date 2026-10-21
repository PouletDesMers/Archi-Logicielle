// ENTITÉ : identité stable, état qui évolue dans le temps.
export class Customer {
  constructor(id, name, email, creditLimit) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.creditLimit = creditLimit; // un Money
  }
  changeEmail(email) {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error(`Email invalide : ${email}`);
    this.email = email;
  }
  canAfford(amount) {
    return amount.cents <= this.creditLimit.cents;
  } // langage métier
  equals(other) {
    return other instanceof Customer && other.id === this.id;
  }
}
