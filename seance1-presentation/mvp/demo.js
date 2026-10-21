// Démonstration console : le même Presenter piloté par une vue « console ».
import { LoginPresenter } from './LoginPresenter.js';
import { FakeAuthService } from './FakeAuthService.js';

class ConsoleView {
  constructor(email, pwd) {
    this.creds = { email, pwd };
  }
  getCredentials() {
    return this.creds;
  }
  showError(m) {
    console.log('  ✗', m);
  }
  showSuccess(m) {
    console.log('  ✓', m);
  }
  setLoading(b) {
    if (b) console.log('  … chargement');
  }
}

for (const [email, pwd] of [
  ['pas-un-email', '1234'],
  ['demo@ecole.fr', '12'],
  ['demo@ecole.fr', '9999'],
  ['demo@ecole.fr', '1234'],
]) {
  console.log(`Tentative : ${email} / ${pwd}`);
  await new LoginPresenter(
    new ConsoleView(email, pwd),
    new FakeAuthService(),
  ).onSubmit();
}
