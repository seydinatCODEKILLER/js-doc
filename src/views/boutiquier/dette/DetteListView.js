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
      console.log(this.localDettes);

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
        <h2 class="text-xl font-bold">Gestion des articles</h2>
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
    console.log("dettes:", this.localDettes);

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
      onAction: (action, id) => this.controller.handleDetteAction(action, id),
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
