export class ClientCard {
  constructor(config) {
    this.config = {
      data: [],
      itemsPerPage: 6,
      containerId: "client-cards",
      actions: null,
      onAction: null,
      emptyMessage: "Aucun client disponible",
      ...config,
    };

    this.currentPage = 1;
    this.init();
  }

  init() {
    this.createContainer();
    this.renderCards();
    this.setupEvents();
  }

  createContainer() {
    this.container = document.createElement("div");
    this.container.className = "p-4";
    this.container.id = `${this.config.containerId}-container`;

    this.grid = document.createElement("div");
    this.grid.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    this.grid.id = this.config.containerId;

    this.createPagination();

    this.container.appendChild(this.grid);
    this.container.appendChild(this.pagination);
  }

  createPagination() {
    this.pagination = document.createElement("div");
    this.pagination.className = "flex justify-between items-center p-4 mt-6";
    this.pagination.id = `${this.config.containerId}-pagination`;

    this.paginationInfo = document.createElement("div");
    this.paginationInfo.className = "text-sm text-base-content";
    this.paginationInfo.id = `${this.config.containerId}-pagination-info`;

    this.paginationControls = document.createElement("div");
    this.paginationControls.className = "join";

    this.prevBtn = document.createElement("button");
    this.prevBtn.className = "join-item btn btn-sm";
    this.prevBtn.innerHTML = "&larr; Précédent";
    this.prevBtn.id = `${this.config.containerId}-prev`;
    this.prevBtn.disabled = true;

    this.nextBtn = document.createElement("button");
    this.nextBtn.className = "join-item btn btn-sm";
    this.nextBtn.innerHTML = "Suivant &rarr;";
    this.nextBtn.id = `${this.config.containerId}-next`;
    this.nextBtn.disabled = this.config.data.length <= this.config.itemsPerPage;

    this.paginationControls.appendChild(this.prevBtn);
    this.paginationControls.appendChild(this.nextBtn);
    this.pagination.appendChild(this.paginationInfo);
    this.pagination.appendChild(this.paginationControls);
  }

  renderCards() {
    this.grid.innerHTML = "";

    const startIndex = (this.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = startIndex + this.config.itemsPerPage;
    const itemsToShow = this.config.data.slice(startIndex, endIndex);

    if (itemsToShow.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className =
        "col-span-full text-center p-8 text-base-content/50";
      emptyMessage.textContent = this.config.emptyMessage;
      this.grid.appendChild(emptyMessage);
      return;
    }

    itemsToShow.forEach((client) => {
      this.grid.appendChild(this.createClientCard(client));
    });

    this.updatePagination();
  }

  createClientCard(client) {
    const card = document.createElement("div");
    card.className =
      "card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300";
    card.dataset.id = client.id;

    // Card Image (Avatar)
    const cardImage = document.createElement("div");
    cardImage.className =
      "relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center";

    let avatarElement;
    if (client.avatar && client.avatar.trim() !== "") {
      avatarElement = document.createElement("img");
      avatarElement.src = client.avatar;
      avatarElement.className = "w-full rounded-lg object-cover";
      avatarElement.alt = `${client.prenom} ${client.nom}`;
    } else {
      avatarElement = document.createElement("div");
      avatarElement.className =
        "w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl";
      avatarElement.textContent =
        client.nom.charAt(0).toUpperCase() +
        client.prenom.charAt(0).toUpperCase();
    }

    // Status badge (compte existant ou non)
    const accountBadge = document.createElement("div");
    accountBadge.className = `absolute top-2 right-2 badge ${
      client.has_account ? "badge-success" : "badge-warning"
    }`;
    accountBadge.textContent = client.has_account
      ? "Avec compte"
      : "Sans compte";

    cardImage.appendChild(avatarElement);
    cardImage.appendChild(accountBadge);

    // Card Body
    const cardBody = document.createElement("div");
    cardBody.className = "p-4";

    // Client Name
    const name = document.createElement("h3");
    name.className = "text-lg font-medium truncate mb-1";
    name.textContent = `${client.prenom} ${client.nom}`;

    // Email (seulement si le client a un compte)
    if (client.has_account && client.email) {
      const email = document.createElement("p");
      email.className =
        "text-xs font-medium text-gray-600 dark:text-gray-300 truncate mb-2";
      email.textContent = client.email;
      cardBody.appendChild(email);
    }

    // Telephone
    const telephone = document.createElement("div");
    telephone.className = "flex items-center text-sm mb-3";
    telephone.innerHTML = `<i class="ri-phone-line mr-2"></i> ${
      client.telephone || "Non renseigné"
    }`;

    // Nombre de boutiquiers associés
    const boutiquiersCount = document.createElement("div");
    boutiquiersCount.className = "flex items-center text-sm mb-3";
    boutiquiersCount.innerHTML = `<i class="ri-store-2-line mr-2"></i> ${
      client.boutiquiers_count
    } boutiquier(s)`;

    // Actions
    const cardActions = document.createElement("div");
    cardActions.className =
      "flex justify-end items-center pt-2 border-t border-base-200";

    if (this.config.actions) {
      cardActions.appendChild(this.renderActions(client));
    }

    // Assemble card body
    cardBody.appendChild(name);
    cardBody.appendChild(telephone);
    cardBody.appendChild(boutiquiersCount);
    cardBody.appendChild(cardActions);

    // Assemble card
    card.appendChild(cardImage);
    card.appendChild(cardBody);

    return card;
  }

  renderActions(item) {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex gap-2";

    this.config.actions.items
      .filter((action) => !action.visible || action.visible(item))
      .forEach((action) => {
        const button = document.createElement("button");
        button.className = `btn btn-sm ${
          typeof action.className === "function"
            ? action.className(item)
            : action.className || ""
        }`;

        button.innerHTML = `
        <i class="${
          typeof action.icon === "function" ? action.icon(item) : action.icon
        }"></i>
        ${
          typeof action.label === "function" ? action.label(item) : action.label
        }
      `;

        button.onclick = () => {
          const actionType =
            typeof action.action === "function" ? action.action(item) : null;
          this.config.onAction(action.name, item.id, actionType);
        };

        actionsContainer.appendChild(button);
      });

    return actionsContainer;
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.config.data.length / this.config.itemsPerPage
    );

    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    this.paginationInfo.textContent = `Page ${
      this.currentPage
    } sur ${totalPages} (${totalPages > 0 ? totalPages : 0} pages)`;
  }

  setupEvents() {
    if (this.config.onAction) {
      this.grid.addEventListener("click", (e) => {
        const actionItem = e.target.closest("[data-action]");
        if (actionItem) {
          e.preventDefault();
          this.config.onAction(
            actionItem.dataset.action,
            actionItem.dataset.id
          );
        }
      });
    }

    this.prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCards();
      }
    });

    this.nextBtn.addEventListener("click", () => {
      if (
        this.currentPage <
        Math.ceil(this.config.data.length / this.config.itemsPerPage)
      ) {
        this.currentPage++;
        this.renderCards();
      }
    });
  }

  updateData(newData) {
    this.config.data = newData;
    this.currentPage = 1;
    this.renderCards();
  }

  cleanup() {
    if (this.grid && this.config.onAction) {
      this.grid.removeEventListener("click", this.handleAction);
    }
  }

  render() {
    return this.container;
  }
}
