// Singleton « classique » : champ statique privé + constructeur contrôlé.
export class Config {
  static #instance;
  #values = {};

  constructor() {
    if (Config.#instance) return Config.#instance; // renvoie l'instance existante
    Config.#instance = this;
  }
  static getInstance() {
    return new Config();
  }
  get(key) {
    return this.#values[key];
  }
  set(key, value) {
    this.#values[key] = value;
    return this;
  }
}
