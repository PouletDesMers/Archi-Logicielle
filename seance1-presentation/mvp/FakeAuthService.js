// Service d'authentification simulé (remplacerait un appel HTTP réel).
export class FakeAuthService {
  async login(email, pwd) {
    await new Promise(r => setTimeout(r, 300)); // latence simulée
    return email === 'demo@ecole.fr' && pwd === '1234';
  }
}
