import fs from 'node:fs';

export class JsonFileOrderRepository {
  constructor(file) {
    this.file = file;
  }

  all() {
    return JSON.parse(fs.readFileSync(this.file, 'utf8'));
  }
}
