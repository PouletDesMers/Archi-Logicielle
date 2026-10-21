// Abstract Factory : créer des FAMILLES d'objets qui vont ensemble.
// Usage : node abstract-factory.js dark   (ou light)
class LightButton {
  render() {
    return '[ Bouton clair  ]';
  }
}
class LightModal {
  render() {
    return '┌ Modale claire ┐';
  }
}
class DarkButton {
  render() {
    return '[■ Bouton sombre ■]';
  }
}
class DarkModal {
  render() {
    return '▛ Modale sombre ▜';
  }
}

class LightThemeFactory {
  createButton() {
    return new LightButton();
  }
  createModal() {
    return new LightModal();
  }
}
class DarkThemeFactory {
  createButton() {
    return new DarkButton();
  }
  createModal() {
    return new DarkModal();
  }
}

// Le client ne connaît que l'interface de la fabrique : jamais de classe concrète.
function buildScreen(factory) {
  return [factory.createModal().render(), factory.createButton().render()].join('\n  ');
}

const factories = { light: new LightThemeFactory(), dark: new DarkThemeFactory() };
const choice = process.argv[2];
for (const [name, f] of Object.entries(factories).filter(
  ([n]) => !choice || n === choice,
)) {
  console.log(`Thème ${name} :\n  ${buildScreen(f)}`);
}
// Impossible d'avoir un bouton clair dans une modale sombre : cohérence garantie.
