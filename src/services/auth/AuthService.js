export class AuthService {
  constructor({ api, storage }) {
    this.api = api;
    this.storage = storage;
  }

  async login({ email, password }) {
    const users = await this.api.get(`/utilisateurs`);
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }
    this.storage.set("auth_token", btoa(JSON.stringify(user)));
    this.storage.set("user", user);
    return user;
  }

  logout() {
    this.storage.remove("auth_token");
    this.storage.remove("user");
  }

  getCurrentUser() {
    return this.storage.get("user");
  }
}
