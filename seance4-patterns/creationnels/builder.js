// Builder : construire pas à pas un objet complexe, validé à la fin.
class HttpRequest {
  constructor(props) {
    Object.assign(this, props);
    Object.freeze(this);
  } // immuable
  toString() {
    const headers = Object.entries(this.headers)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n');
    const body = this.body ? `\n  body: ${this.body}` : '';
    return `${this.method} ${this.url}  (timeout ${this.timeout} ms)\n${headers}${body}`;
  }
}

class HttpRequestBuilder {
  #req = { method: 'GET', headers: {}, timeout: 5000, body: undefined };

  url(u) {
    this.#req.url = u;
    return this;
  } // « return this » = interface fluide
  method(m) {
    this.#req.method = m.toUpperCase();
    return this;
  }
  header(k, v) {
    this.#req.headers[k] = v;
    return this;
  }
  bearer(tok) {
    return this.header('Authorization', `Bearer ${tok}`);
  }
  json(data) {
    this.#req.body = JSON.stringify(data);
    return this.header('Content-Type', 'application/json');
  }
  timeout(ms) {
    this.#req.timeout = ms;
    return this;
  }

  build() {
    if (!this.#req.url) throw new Error('URL obligatoire');
    if (this.#req.method === 'GET' && this.#req.body)
      throw new Error('Un GET ne doit pas avoir de corps');
    return new HttpRequest({ ...this.#req, headers: { ...this.#req.headers } });
  }
}

const req = new HttpRequestBuilder()
  .url('https://api.shoplite.fr/orders')
  .method('post')
  .bearer('abc123')
  .json({ productId: 42, qty: 2 })
  .timeout(3000)
  .build();
console.log(req.toString());

try {
  new HttpRequestBuilder().url('/x').json({ a: 1 }).build();
} catch (e) {
  console.log('✗ Validation dans build() :', e.message);
}
