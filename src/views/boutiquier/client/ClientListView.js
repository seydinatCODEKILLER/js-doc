import { FloatingActionButton } from "../../../components/button/FloatingButton.js";
import { ClientCard } from "../../../components/card/ClientCard.js";
import { Modal } from "../../../components/modal/Modal.js";
import { ModernTable } from "../../../components/table/Table.js";
import { AbstractView } from "../../AbstractView.js";
import { ClientEditModal } from "./ClientEditModal.js";
import { ClientFormModal } from "./ClientFormModal.js";

export class ClientView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("boutiquier_client");
    this.currentView = "cards";
    this.localClients = [];
    this.formModal = new ClientFormModal(app);
  }

  async setup() {
    try {
      this.localClients = await this.controller.loadClients();

      this.renderHeader();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.log(error);
      this.showError("Erreur de chargement des clients");
    }
  }

  renderHeader() {
    const header = document.createElement("div");
    header.className = "flex justify-between items-center py-6 px-3";
    header.innerHTML = `
      <div>
        <h2 class="text-xl font-bold">Gestion des clients</h2>
        <p class="text-sm text-gray-600">
          ${this.localClients.length} clients
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
    const cards = new ClientCard({
      data: this.localClients,
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
        this.handleClientAction(action, id, actionType),
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const table = new ModernTable({
      columns: [
        {
          header: "Avatar",
          key: "avatar",
          render: (item) => {
            return `<image src="${item.avatar}" class="w-12 h-12 object-cover rounded-full" />`;
          },
        },
        { header: "Nom", key: "nom", sortable: true },
        { header: "Prénom", key: "prenom", sortable: true },
        { header: "Telephone", key: "telephone" },
        {
          header: "Date Association",
          key: "date_association",
          sortable: true,
          render: (item) =>
            new Date(item.date_association).toLocaleDateString(),
        },
        {
          header: "Statut",
          key: "deleted",
          render: (item) => {
            return `<span class="badge badge-${
              item.deleted ? "warning" : "success"
            }">${item.deleted ? "Inactif" : "Actif"}</span>`;
          },
        },
      ],
      data: this.localClients,
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
            action: (item) => (item.deleted ? "restore" : "delete"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleClientAction(action, id, actionType),
    });
    container.appendChild(table.render());
    table.update(this.localClients, 1);
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

  async handleClientAction(action, id, actionType) {
    console.log(id)
    const client = this.findClientById(id);
    console.log(client)
    if (!client) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(client);
          break;
        case "toggleStatus":
          await this.handleStatusToggle(id, actionType);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findClientById(id) {
    return this.localClients.find((b) => b.id == id);
  }

  async handleEditAction(client) {
    const modal = new ClientEditModal(this.app, client);
    modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDeleteAction = actionType === "delete";
    const confirmed = await this.showConfirmation(
      isDeleteAction
        ? "Voulez vous vraiment Désactiver ce client ?"
        : "Voulez vous vraiment Restaurer ce client ?"
    );

    if (!confirmed) return;

    await (isDeleteAction
      ? this.controller.deleteClient(id)
      : this.controller.restoreClient(id));

    await this.refreshView();
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  async refreshView() {
    this.localClients = await this.controller.loadClients(true);
    this.renderContent();
  }

  async showConfirmation(message) {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmation",
        content: message,
        confirmText: "Confirmer",
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }
}
