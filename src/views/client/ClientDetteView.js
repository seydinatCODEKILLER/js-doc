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
      console.log(this.localDettes);

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
          console.log("OUVERTURE MODALE !");
          console.log("Instance de formModal:", this.formModal);
          console.log(
            "Méthode open existe:",
            typeof this.formModal.open === "function"
          );
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
  
  renderTableView(container) {
    console.log("dettes:", this.localDettes);

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
        // {
        //   header: "Statut",
        //   key: "statut",
        //   render: (item) => {
        //     const statusMap = {
        //       en_attente: { class: "badge-warning", text: "En attente" },
        //       accepted: { class: "badge-success", text: "Acceptée" },
        //       rejected: { class: "badge-error", text: "Refusée" },
        //     };
        //     const status = statusMap[item.statut] || statusMap.en_attente;
        //     return `<span class="badge ${status.class}">${status.text}</span>`;
        //   },
        // },
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
    //   actions: {
    //     displayMode: "direct",
    //     items: [
    //       {
    //         name: "accept",
    //         label: "Accepter",
    //         icon: "ri-check-line",
    //         className: "btn-success",
    //         visible: (item) => item.statut === "en_attente",
    //       },
    //       {
    //         name: "reject",
    //         label: "Refuser",
    //         icon: "ri-close-line",
    //         className: "btn-error",
    //         visible: (item) => item.statut === "en_attente",
    //       },
    //     ],
    //   },
    //   onAction: (action, id) => this.controller.handleDetteAction(action, id),
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
