import { AbstractView } from "../AbstractView.js";

export class UnauthorizedView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("Auth");
  }

  async getContent() {
    const container = document.createElement("div");
    container.className = "unauthorized-container text-center space-y-4";

    const user = this.app.store.state.user;
    const path = user ? this.rolePath(user.role) : "/login";

    container.innerHTML = `
      <h1 class="text-2xl font-bold text-warning">Accès refusé</h1>
      <p class="text-gray-600 text-sm font-medium">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <a href="${path}" class="btn btn-primary">
        ${user ? "Retour à l'accueil" : "Se connecter"}
      </a>
    `;

    return container;
  }

  async setup() {
    console.log("bonjour");
  }

  rolePath(role) {
    const routes = {
      admin: "/admin/dashboard",
      boutiquier: "/boutiquier/products",
      client: "/boutique",
    };

    return routes[role] || "/";
  }
}
