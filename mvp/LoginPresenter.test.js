// Le Presenter se teste avec une FAUSSE vue : aucun navigateur nécessaire.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LoginPresenter } from './LoginPresenter.js';

function fakeView(email, pwd) {
  return {
    errors: [],
    successes: [],
    loading: [],
    getCredentials: () => ({ email, pwd }),
    showError(m) {
      this.errors.push(m);
    },
    showSuccess(m) {
      this.successes.push(m);
    },
    setLoading(b) {
      this.loading.push(b);
    },
  };
}
const okAuth = { login: async () => true };
const koAuth = { login: async () => false };

test('email invalide : erreur et aucun appel au service', async () => {
  const view = fakeView('invalide', '1234');
  let called = false;
  await new LoginPresenter(view, { login: async () => (called = true) }).onSubmit();
  assert.deepEqual(view.errors, ['Email invalide']);
  assert.equal(called, false);
});

test('identifiants corrects : message de succès', async () => {
  const view = fakeView('a@b.fr', '1234');
  await new LoginPresenter(view, okAuth).onSubmit();
  assert.equal(view.successes.length, 1);
  assert.deepEqual(view.loading, [true, false]); // le chargement est bien arrêté
});

test('identifiants refusés : message d’erreur', async () => {
  const view = fakeView('a@b.fr', '1234');
  await new LoginPresenter(view, koAuth).onSubmit();
  assert.deepEqual(view.errors, ['Identifiants incorrects']);
});
