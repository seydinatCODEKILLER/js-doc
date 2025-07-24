export class AuthController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("auth");
  }

  async login(credentials) {
    try {
      const user = await this.service.login(credentials);

      this.app.store.setState({
        user,
        isAuthenticated: true,
        role: user.role,
      });

      this.app.eventBus.publish("auth:login", user);
      this.app.services.notifications.show(
        `Bienvenue, ${user.prenom}`,
        "success",
        true
      );
      this.redirectAfterLogin(user.role);

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  redirectAfterLogin(role) {
    const routes = {
      admin: "/admin/dashboard",
      boutiquier: "/boutiquier/products",
      client: "/boutique",
    };

    this.app.router.navigateTo(routes[role]);
  }

  logout() {
    this.service.logout();
    this.app.store.setState({
      user: null,
      isAuthenticated: false,
      role: null,
    });
    this.app.eventBus.publish("auth:logout");
    this.app.router.navigateTo("/");
  }
}
