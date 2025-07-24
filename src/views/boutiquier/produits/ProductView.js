import { FloatingActionButton } from "../../../components/button/FloatingButton.js";
import { ProductCard } from "../../../components/card/ProductCard.js";
import { ModernTable } from "../../../components/table/Table.js";
import { AbstractView } from "../../AbstractView.js";
import { ProductFormModal } from "./ProductFormModal.js";


export class ProductView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("product");
    this.currentView = "cards";
    this.localProducts = [];
    this.formModal = new ProductFormModal(app);
  }

  async setup() {
    try {
      this.localProducts = await this.controller.loadProducts();

      this.renderHeader();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
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
        <h2 class="text-xl font-bold">Gestion des produits</h2>
        <p class="text-sm text-gray-600">
          ${this.localProducts.length} produits
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

  initFloatingButton() {
    this.fab = new FloatingActionButton({
      icon: "ri-add-line",
      color: "primary",
      position: "bottom-right",
      size: "lg",
      onClick: () => {
        this.formModal.open();
      },
    });
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
      data: this.localProducts,
      actions: {
        items: [
          {
            name: "edit",
            label: "Modifier",
            icon: "ri-edit-line",
            visible: (item) => !item.deleted,
          },
          {
            name: "toggleStatus",
            label: this.getStatusButtonLabel,
            icon: this.getStatusButtonIcon,
            className: this.getStatusButtonClass,
            action: (item) => (item.deleted ? "restore" : "delete"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.controller.handleProductAction(action, id, actionType),
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
            return `<image src="${item.image}" class="w-12 h-12  object-cover rounded-full" />`;
          },
        },
        { header: "Nom", key: "nom", sortable: true },
        { header: "Prix", key: "prix", sortable: true },
        { header: "Quantite", key: "quantite" },
        {
          header: "Statut",
          key: "deleted",
          render: (item) => {
            return `<span class="badge badge-${
              item.deleted ? "warning" : "success"
            }">${item.deleted ? "Indisponible" : "Disponible"}</span>`;
          },
        },
      ],
      data: this.localProducts,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "edit",
            icon: "ri-edit-line",
            className: "btn-primary",
            visible: (item) => !item.deleted,
          },
          {
            name: "toggleStatus",
            icon: (item) =>
              item.deleted ? "ri-refresh-line" : "ri-delete-bin-line",
            className: (item) => (item.deleted ? "btn-success" : "btn-error"),
            action: (item) => (!item.deleted ? "restore" : "delete"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.controller.handleProductAction(action, id, actionType),
    });
    container.appendChild(table.render());
    table.update(this.localProducts, 1);
  }

  cleanup() {
    if (this.fab) this.fab.destroy();
    if (this.formModal) this.formModal.close();
  }

  getStatusButtonLabel(item) {
    return item.deleted ? "Restaurer" : "Désactiver";
  }

  getStatusButtonIcon(item) {
    return item.deleted ? "ri-refresh-line" : "ri-delete-bin-line";
  }

  getStatusButtonClass(item) {
    return item.deleted ? "btn-success" : "btn-error";
  }
}