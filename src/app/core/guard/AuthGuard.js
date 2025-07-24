export class AuthGuard {
  static async execute(app) {
    if (!app.store.getState().isAuthenticated) {
      app.services.notifications.show("Accès non autorisé", "warning");
      return { redirect: "/login" };
    }
    return { granted: true };
  }
}
