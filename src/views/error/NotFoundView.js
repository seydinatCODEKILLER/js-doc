import { AbstractView } from "../AbstractView.js";

export class NotFoundView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("Auth");
  }

  async getContent() {
    const container = document.createElement("div");
    container.className = "not-found-container text-center space-y-4";

    const user = this.app.store.state.user;
    const path = user ? this.rolePath(user.role) : "/login";

    container.innerHTML = `
      <h1 class="text-4xl font-bold text-error">404 - Page non trouvée</h1>
      <p class="text-gray-600 text-sm font-medium">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <a href="${path}" class="btn btn-primary">
        ${user ? "Retour à l'accueil" : "Aller à la page de connexion"}
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
