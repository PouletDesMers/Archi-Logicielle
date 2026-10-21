// VIEWMODEL : état observable + commandes. AUCUNE référence au DOM.
import { observable } from './observable.js';

export class CartViewModel {
  items = observable([]);
  total = observable(0);
  count = observable(0);

  addItem(product) {
    this.#update([...this.items.get(), product]);
  }
  removeAt(index) {
    this.#update(this.items.get().filter((_, i) => i !== index));
  }
  #update(items) {
    this.items.set(items);
    this.count.set(items.length);
    this.total.set(items.reduce((sum, p) => sum + p.price, 0));
  }
}
