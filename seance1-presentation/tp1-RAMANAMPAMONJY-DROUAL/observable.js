// Mini-système réactif : c'est, en très simplifié, ce que fournissent
// ref() de Vue.js, les signals d'Angular ou les observables de Knockout.
export function observable(initial) {
  let value = initial;
  const subscribers = new Set();
  return {
    get: () => value,
    set(next) {
      value = next;
      subscribers.forEach(fn => fn(value));
    },
    subscribe(fn) {
      subscribers.add(fn);
      fn(value);
      return () => subscribers.delete(fn);
    },
  };
}
