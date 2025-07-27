import { Modal } from "../../../components/modal/Modal.js";
import { ModernTable } from "../../../components/table/Table.js";
import { AbstractView } from "../../AbstractView.js";

export class DetteView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("boutiquier_dette");
    this.localDettes = [];
  }

  async setup() {
    try {
      this.localDettes = await this.controller.loadDettes();
      this.renderHeader();
      this.renderContent();
    } catch (error) {
      console.log(error);
      this.showError("Erreur de chargement des dettes");
    }
  }

  renderHeader() {
    const header = document.createElement("div");
    header.className = "flex justify-between items-center py-6 px-3";
    header.innerHTML = `
      <div>
        <h2 class="text-xl font-bold">Gestion des dettes</h2>
        <p class="text-sm text-gray-600">
          ${this.localDettes.length} dettes
        </p>
      </div>
    `;
    this.container.appendChild(header);
  }

  renderContent() {
    const content =
      this.container.querySelector("#content-container") ||
      document.createElement("div");
    content.id = "content-container";
    content.innerHTML = "";
    this.renderTableView(content);

    if (!this.container.querySelector("#content-container")) {
      this.container.appendChild(content);
    }
  }

  renderTableView(container) {
    const table = new ModernTable({
      columns: [
        {
          header: "Client",
          key: "id_client",
          render: (item) => `Client #${item.id_client}`,
        },
        {
          header: "Montant",
          key: "montant",
          sortable: true,
          render: (item) => `${item.montant} FCFA`,
        },
        {
          header: "Statut",
          key: "statut",
          render: (item) => {
            const statusMap = {
              en_attente: { class: "badge-warning", text: "En attente" },
              accepted: { class: "badge-success", text: "Acceptée" },
              rejected: { class: "badge-error", text: "Refusée" },
            };
            const status = statusMap[item.statut] || statusMap.en_attente;
            return `<span class="badge ${status.class}">${status.text}</span>`;
          },
        },
        {
          header: "Date demande",
          key: "date_demande",
          sortable: true,
          render: (item) => new Date(item.date_demande).toLocaleDateString(),
        },
        {
          header: "Date traitement",
          key: "date_traitement",
          render: (item) =>
            item.date_traitement
              ? new Date(item.date_traitement).toLocaleDateString()
              : "-",
        },
      ],
      data: this.localDettes,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "accept",
            label: "Accepter",
            icon: "ri-check-line",
            className: "btn-success",
            visible: (item) => item.statut === "en_attente",
          },
          {
            name: "reject",
            label: "Refuser",
            icon: "ri-close-line",
            className: "btn-error",
            visible: (item) => item.statut === "en_attente",
          },
        ],
      },
      onAction: async (action, id) => await this.handleDetteAction(action, id),
      searchable: true,
    });
    container.appendChild(table.render());
    setTimeout(() => {
      table.update(this.localDettes, 1);
    }, 0);
  }

  cleanup() {
    if (this.fab) this.fab.destroy();
  }

  async handleDetteAction(action, id) {
    try {
      switch (action) {
        case "accept":
          await this.acceptDette(id);
          break;
        case "reject":
          await this.rejectDette(id);
          break;
        default:
          console.warn("Action non gérée:", action);
      }
    } catch (error) {
      console.error("Erreur action dette:", error);
      this.app.services.notifications.show(
        error.message || "Erreur lors de l'action",
        "error"
      );
    }
  }

  async acceptDette(id){
    console.log("Accepting dette with id:", id);
    
    const confirmed = await this.showConfirmation("Voulez vous vraiment accepter cette dette ?");
    if (!confirmed) return;
    await this.controller.acceptDette(id);
    this.refreshView();
  }

  async rejectDette(id) {
    const confirmed = await this.showConfirmation("Voulez vous vraiment refuser cette dette ?");
    if (!confirmed) return;
    await this.controller.rejectDette(id);
    this.refreshView();
  }

  findDetteById(id) {
    return this.localDettes.find((b) => b.id == id);
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  async refreshView() {
    this.localDettes = await this.controller.loadDettes(true);
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
