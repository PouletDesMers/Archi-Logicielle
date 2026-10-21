// Exécute les démonstrations console, éventuellement filtrées par séance.
import { spawnSync } from 'node:child_process';

const DEMOS = [
  'seance1-presentation/mvp/demo.js',
  'seance2-architecture/clean/main.js',
  'seance2-architecture/hexagonal/cli.js',
  'seance3-solid/srp.js',
  'seance3-solid/ocp.js',
  'seance3-solid/lsp.js',
  'seance3-solid/isp.js',
  'seance3-solid/dip.js',
  'seance3-solid/di/main.js',
  'seance4-patterns/creationnels/singleton/demo.js',
  'seance4-patterns/creationnels/factory.js',
  'seance4-patterns/creationnels/abstract-factory.js',
  'seance4-patterns/creationnels/builder.js',
  'seance4-patterns/creationnels/prototype.js',
  'seance4-patterns/structuraux/adapter.js',
  'seance4-patterns/structuraux/bridge.js',
  'seance4-patterns/structuraux/composite.js',
  'seance4-patterns/structuraux/decorator.js',
  'seance4-patterns/structuraux/facade.js',
  'seance4-patterns/structuraux/proxy.js',
  'seance5-comportement-ddd/comportementaux/observer.js',
  'seance5-comportement-ddd/comportementaux/strategy.js',
  'seance5-comportement-ddd/comportementaux/command.js',
  'seance5-comportement-ddd/comportementaux/template-method.js',
  'seance5-comportement-ddd/comportementaux/iterator.js',
  'seance5-comportement-ddd/comportementaux/state.js',
  'seance5-comportement-ddd/ddd/demo.js',
];
const filter = process.argv[2];
for (const file of DEMOS.filter(f => !filter || f.startsWith(filter))) {
  console.log(`\n\x1b[33m━━━ node ${file} ━━━\x1b[0m`);
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`Échec : ${file}`);
    process.exitCode = 1;
  }
}
