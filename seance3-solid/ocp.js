// O – Open/Closed Principle : ouvert à l'extension, fermé à la modification.

// ── AVANT : chaque nouvelle forme oblige à MODIFIER la fonction ─────────
function areaSwitch(shape) {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.r ** 2;
    case 'rect':
      return shape.w * shape.h;
    default:
      throw new Error(`Type inconnu : ${shape.type}`);
  }
}
console.log('AVANT :');
try {
  areaSwitch({ type: 'triangle', b: 4, h: 3 });
} catch (e) {
  console.log('  ✗', e.message, '→ il faut modifier areaSwitch()');
}

// ── APRÈS : chaque forme sait calculer son aire (polymorphisme) ─────────
class Circle {
  constructor(r) {
    this.r = r;
  }
  area() {
    return Math.PI * this.r ** 2;
  }
}
class Rect {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
  area() {
    return this.w * this.h;
  }
}
// Extension SANS toucher au code existant :
class Triangle {
  constructor(b, h) {
    this.b = b;
    this.h = h;
  }
  area() {
    return (this.b * this.h) / 2;
  }
}

// Cette fonction ne changera plus jamais :
const totalArea = shapes => shapes.reduce((sum, s) => sum + s.area(), 0);
console.log('APRÈS :');
console.log(
  '  aire totale =',
  totalArea([new Circle(1), new Rect(2, 3), new Triangle(4, 3)]).toFixed(2),
);
