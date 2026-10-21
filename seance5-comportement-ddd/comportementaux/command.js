// Command : encapsuler une action dans un objet (exécuter, annuler, journaliser).
class Editor {
  text = '';
}

class InsertCommand {
  constructor(editor, str) {
    this.editor = editor;
    this.str = str;
  }
  execute() {
    this.editor.text += this.str;
  }
  undo() {
    this.editor.text = this.editor.text.slice(0, -this.str.length);
  }
  toString() {
    return `Insérer "${this.str}"`;
  }
}
class DeleteCommand {
  constructor(editor, n) {
    this.editor = editor;
    this.n = n;
  }
  execute() {
    this.removed = this.editor.text.slice(-this.n);
    this.editor.text = this.editor.text.slice(0, -this.n);
  }
  undo() {
    this.editor.text += this.removed;
  }
  toString() {
    return `Supprimer ${this.n} caractère(s)`;
  }
}
class UpperCaseCommand {
  constructor(editor) {
    this.editor = editor;
  }
  execute() {
    this.before = this.editor.text;
    this.editor.text = this.editor.text.toUpperCase();
  }
  undo() {
    this.editor.text = this.before;
  }
  toString() {
    return 'Mettre en majuscules';
  }
}

// Invocateur : exécute, historise, annule et rétablit
class CommandManager {
  #done = [];
  #undone = [];
  run(cmd) {
    cmd.execute();
    this.#done.push(cmd);
    this.#undone = [];
  }
  undo() {
    const c = this.#done.pop();
    if (c) {
      c.undo();
      this.#undone.push(c);
    }
  }
  redo() {
    const c = this.#undone.pop();
    if (c) {
      c.execute();
      this.#done.push(c);
    }
  }
  history() {
    return this.#done.map(String);
  }
}

const ed = new Editor();
const mgr = new CommandManager();
const show = label => console.log(`${label.padEnd(22)} → "${ed.text}"`);

mgr.run(new InsertCommand(ed, 'Bonjour'));
show('insert Bonjour');
mgr.run(new InsertCommand(ed, ' le monde'));
show('insert " le monde"');
mgr.run(new UpperCaseCommand(ed));
show('majuscules');
mgr.run(new DeleteCommand(ed, 9));
show('delete 9');
mgr.undo();
show('undo');
mgr.undo();
show('undo');
mgr.redo();
show('redo');
console.log('Journal :', mgr.history());
