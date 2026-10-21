import { Config } from './Config.js';
import { logger } from './logger.js';
import { runA } from './moduleA.js';
import { runB } from './moduleB.js';

console.log('1) Singleton avec classe :');
Config.getInstance().set('currency', 'EUR');
const c2 = new Config(); // pas de nouvel objet !
console.log(
  '   même instance ?',
  Config.getInstance() === c2,
  '| currency =',
  c2.get('currency'),
);

console.log('2) Singleton par module ES :');
runA();
runB();
console.log('   historique partagé :', logger.history());
