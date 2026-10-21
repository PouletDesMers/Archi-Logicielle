// Conteneur d'injection de dépendances minimal (principe d'Awilix, InversifyJS, NestJS…).
export class Container {
  #registry = new Map();

  register(name, factory, { singleton = false } = {}) {
    this.#registry.set(name, { factory, singleton, instance: undefined });
    return this; // interface fluide
  }

  resolve(name, stack = []) {
    const entry = this.#registry.get(name);
    if (!entry) throw new Error(`Dépendance inconnue : ${name}`);
    if (stack.includes(name))
      throw new Error(`Dépendance circulaire : ${[...stack, name].join(' -> ')}`);
    const build = () =>
      entry.factory({ resolve: n => this.resolve(n, [...stack, name]) });
    if (!entry.singleton) return build(); // nouvelle instance à chaque fois
    return (entry.instance ??= build()); // instance unique, créée à la demande
  }
}
