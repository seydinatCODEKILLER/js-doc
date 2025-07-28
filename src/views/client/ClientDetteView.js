import { FloatingActionButton } from "../../components/button/FloatingButton.js";
import { ModernTable } from "../../components/table/Table.js";
import { AbstractView } from "../AbstractView.js";
import { ClientDetteFormModal } from "./ClientDetteFormModal.js";

export class ClientDetteView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("client_dette");
    this.localDettes = [];
    this.formModal = new ClientDetteFormModal(app);
  }

  async setup() {
    try {
      this.localDettes = await this.controller.loadDettes();
      this.renderHeader();
      this.renderContent();
      this.initFloatingButton();
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
        <h2 class="text-xl font-bold">Liste de vos dettes</h2>
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

  renderTableView(container) {
    const table = new ModernTable({
      columns: [
        {
          header: "Boutiquier",
          key: "id_boutiquier",
          render: (item) => `Boutiquier #${item.id_boutiquier}`,
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
}
