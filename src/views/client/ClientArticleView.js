import { FloatingActionButton } from "../../components/button/FloatingButton.js";
import { ProductCard } from "../../components/card/ProductCard.js";
import { ModernTable } from "../../components/table/Table.js";
import { AbstractView } from "../../views/AbstractView.js";


export class ClientArticleView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("client");
    this.currentView = "cards";
    this.localArticles = [];
    this.config = {
      tableId: "produits",
      searchable: true
    };
    }

  async setup() {
    try {
      this.localArticles = await this.controller.loadArticles();
      
      this.renderHeader();
      this.renderViewToggle();
      this.renderContent();
    } catch (error) {
      console.log(error);
      this.showError("Erreur de chargement des boutiquiers");
    }
  }

  renderHeader() {
    const header = document.createElement("div");
    header.className = "flex justify-between items-center py-6 px-3";
    header.innerHTML = `
      <div>
        <h2 class="text-xl font-bold">Liste des produits</h2>
        <p class="text-sm text-gray-600">
          ${this.localArticles.length} produits
        </p>
      </div>
    `;
    this.container.appendChild(header);
  }

  renderViewToggle() {
    this.viewButtons = {};

    const toggleGroup = document.createElement("div");
    toggleGroup.className =
      "view-toggle-group flex rounded-lg mb-6 overflow-hidden px-3";

    ["cards", "table"].forEach((viewType) => {
      const button = document.createElement("button");
      button.className = this.getToggleButtonClass(viewType);
      button.innerHTML =
        viewType === "cards"
          ? '<i class="ri-grid-fill mr-2"></i>Cartes'
          : '<i class="ri-table-fill mr-2"></i>Tableau';

      this.viewButtons[viewType] = button;

      this.addEventListener(button, "click", () => this.switchView(viewType));
      toggleGroup.appendChild(button);
    });

    this.container.appendChild(toggleGroup);
  }

  getToggleButtonClass(viewType) {
    return `px-4 py-2 transition duration-150 ${
      this.currentView === viewType
        ? "bg-primary text-white"
        : "bg-white hover:bg-base-200"
    }`;
  }

  switchView(viewType) {
    if (this.currentView !== viewType) {
      this.currentView = viewType;

      Object.entries(this.viewButtons).forEach(([type, button]) => {
        button.className = this.getToggleButtonClass(type);
      });
      this.renderContent();
    }
  }

  renderContent() {
    const content =
    this.container.querySelector("#content-container") ||
    document.createElement("div");
    content.id = "content-container";
    content.innerHTML = "";

    if (this.currentView === "cards") {
      this.renderCardsView(content);
    } else {
      this.renderTableView(content);
    }

    if (!this.container.querySelector("#content-container")) {
      this.container.appendChild(content);
    }
    
  }

  renderCardsView(container) {
    const cards = new ProductCard({
      data: this.localArticles,
    });
    container.appendChild(cards.render());
  }


  renderTableView(container) {
    const table = new ModernTable({
      columns: [
        {
          header: "Image",
          key: "image",
          render: (item) => {
            return `<image src="${item.image}" class="w-12 h-12 rounded object-cover rounded-full" />`;
          },
        },
        { header: "Nom", key: "nom", sortable: true },
        { header: "Description", key: "description", sortable: true },
        { header: "Prix unitaire", key: "prix" },
        { header: "Quantité en stock", key: "quantite" },
      ],
      data: this.localArticles,
      searchable: true,
    });
    container.appendChild(table.render());
    table.update(this.localArticles, 1);
  }

}
