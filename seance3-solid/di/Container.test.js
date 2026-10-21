import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Container } from './Container.js';

test('singleton : même instance', () => {
  const c = new Container().register('x', () => ({}), { singleton: true });
  assert.equal(c.resolve('x'), c.resolve('x'));
});

test('transitoire : nouvelle instance', () => {
  const c = new Container().register('x', () => ({}));
  assert.notEqual(c.resolve('x'), c.resolve('x'));
});

test('on peut remplacer une dépendance en test', () => {
  const c = new Container()
    .register('mailer', () => ({ send: () => 'vrai' }))
    .register('service', ({ resolve }) => ({ run: () => resolve('mailer').send() }));
  c.register('mailer', () => ({ send: () => 'faux' })); // substitution
  assert.equal(c.resolve('service').run(), 'faux');
});

test('dépendance circulaire détectée', () => {
  const c = new Container()
    .register('a', ({ resolve }) => resolve('b'))
    .register('b', ({ resolve }) => resolve('a'));
  assert.throws(() => c.resolve('a'), /circulaire/);
});
