// PRESENTER : toute la logique de présentation. Il ne connaît la vue
// qu'à travers une INTERFACE (un contrat) :
//   getCredentials() -> { email, pwd }
//   showError(message)   showSuccess(message)   setLoading(bool)
export class LoginPresenter {
  constructor(view, authService) {
    this.view = view;
    this.auth = authService;
  }

  async onSubmit() {
    const { email, pwd } = this.view.getCredentials();
    if (!email.includes('@')) return this.view.showError('Email invalide');
    if (pwd.length < 4)
      return this.view.showError('Mot de passe trop court (4 caractères min.)');

    this.view.setLoading(true);
    try {
      const ok = await this.auth.login(email, pwd);
      ok
        ? this.view.showSuccess(`Bienvenue ${email}`)
        : this.view.showError('Identifiants incorrects');
    } finally {
      this.view.setLoading(false);
    }
  }
}
