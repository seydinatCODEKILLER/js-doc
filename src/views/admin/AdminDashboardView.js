import { StatsCard } from "../../components/card/StatsCard.js";
import { AbstractView } from "../AbstractView.js";

export class AdminDashboardView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("admin");
    this.statsCards = [];
  }

  async render() {
    this.initContainer();
    await this.renderWelcomeMessage();
    await this.renderStatsCards();
    return this.container;
  }

  initContainer() {
    this.container = document.createElement("div");
    this.container.className = "p-6";
  }

  async renderWelcomeMessage() {
    const welcome = document.createElement("div");
    welcome.className = "mb-8";
    welcome.innerHTML = this.getWelcomeTemplate();
    this.container.appendChild(welcome);
  }

  getWelcomeTemplate() {
    return `
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
        Bienvenue, ${this.app.store.state.user.prenom}!
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Gestion des boutiquiers et statistiques
      </p>
    `;
  }

  async renderStatsCards() {
    const stats = await this.controller.getDashboardStats();
    const statsContainer = this.createStatsContainer();

    this.statsCards = [
      this.createStatsCard(
        "Total Boutiquiers",
        stats.total,
        "ri-group-line",
        "blue"
      ),
      this.createStatsCard(
        "Boutiquiers Actifs",
        stats.active,
        "ri-group-line",
        "green"
      ),
      this.createStatsCard(
        "Boutiquiers Supprimés",
        stats.deleted,
        "ri-user-unfollow-line",
        "red"
      ),
    ];

    this.statsCards.forEach((card) => {
      statsContainer.appendChild(card.render());
    });

    this.container.appendChild(statsContainer);
  }

  createStatsContainer() {
    const container = document.createElement("div");
    container.className = "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8";
    return container;
  }

  createStatsCard(title, value, icon, color) {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
    };

    return new StatsCard({
      title,
      value,
      icon,
      color: colorClasses[color],
    });
  }
}
