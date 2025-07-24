export class ProductCard {
  constructor(config) {
    this.config = {
      data: [],
      itemsPerPage: 8,
      containerId: "product-cards",
      actions: null,
      onAction: null,
      emptyMessage: "Aucun produit disponible",
      showCategory: true,
      showStockAlert: true,
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
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
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
      this.showEmptyMessage();
      return;
    }

    itemsToShow.forEach((product) => {
      this.grid.appendChild(this.createProductCard(product));
    });

    this.updatePagination();
  }

  createProductCard(product) {
    const card = document.createElement("div");
    card.className =
      "card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col";
    card.dataset.id = product.id;

    // Card Image
    const cardImage = document.createElement("div");
    cardImage.className =
      "relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center";

    const img = product.image
      ? document.createElement("img")
      : document.createElement("div");

    if (product.image) {
      img.src = product.image;
      img.className = "w-full h-full object-cover";
      img.alt = product.nom;
      img.loading = "lazy";
    } else {
      img.className = "text-4xl text-gray-400";
      img.innerHTML = '<i class="ri-shopping-bag-line"></i>';
    }

    // Stock Alert Badge
    if (
      this.config.showStockAlert &&
      product.quantite <= product.seuil_alerte
    ) {
      const stockBadge = document.createElement("div");
      stockBadge.className = "absolute top-2 right-2 badge badge-warning gap-1";
      stockBadge.innerHTML = `<i class="ri-alarm-warning-line"></i> Stock faible`;
      cardImage.appendChild(stockBadge);
    }

    cardImage.appendChild(img);

    // Card Body
    const cardBody = document.createElement("div");
    cardBody.className = "p-4 flex-grow flex flex-col";

    // Product Name
    const name = document.createElement("h3");
    name.className = "text-lg font-semibold mb-2 line-clamp-2";
    name.textContent = product.nom;

    // Category
    if (this.config.showCategory && product.categorie) {
      const category = document.createElement("div");
      category.className = "badge badge-outline badge-sm mb-2 self-start";
      category.textContent = product.categorie;
      cardBody.appendChild(category);
    }

    // Description
    if (product.description) {
      const desc = document.createElement("p");
      desc.className =
        "text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2";
      desc.textContent = product.description;
      cardBody.appendChild(desc);
    }

    // Price
    const price = document.createElement("div");
    price.className = "text-xl font-bold text-primary mt-auto mb-3";
    price.textContent = `${product.prix} FCFA`;

    // Stock
    const stock = document.createElement("div");
    stock.className = "flex items-center text-sm mb-3";
    stock.innerHTML = `
      <i class="ri-stack-line mr-2"></i>
      <span>Stock: ${product.quantite}</span>
      ${
        product.seuil_alerte
          ? `<span class="text-xs ml-2">(Seuil: ${product.seuil_alerte})</span>`
          : ""
      }
    `;

    // Actions
    const cardActions = document.createElement("div");
    cardActions.className =
      "flex justify-end items-center pt-2 border-t border-base-200 mt-auto";

    if (this.config.actions) {
      cardActions.appendChild(this.renderActions(product));
    }

    // Assemble card body
    cardBody.appendChild(name);
    cardBody.appendChild(price);
    cardBody.appendChild(stock);
    cardBody.appendChild(cardActions);

    // Assemble card
    card.appendChild(cardImage);
    card.appendChild(cardBody);

    return card;
  }

  renderActions(item) {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex gap-2";
    console.log(item);

    this.config.actions.items
      .filter((action) => !action.visible || action.visible(item))
      .forEach((action) => {
        const button = document.createElement("button");
        button.className = `btn btn-sm ${
          typeof action.className === "function"
            ? action.className(item)
            : action.className || "btn-outline"
        }`;

        button.innerHTML = `
          <i class="${
            typeof action.icon === "function" ? action.icon(item) : action.icon
          }"></i>
          ${
            action.label
              ? `
            <span class="hidden sm:inline">
              ${
                typeof action.label === "function"
                  ? action.label(item)
                  : action.label
              }
            </span>
          `
              : ""
          }
        `;

        button.onclick = (e) => {
          e.stopPropagation();
          const actionType =
            typeof action.action === "function" ? action.action(item) : null;
          this.config.onAction(action.name, item.id, actionType);
        };

        actionsContainer.appendChild(button);
      });

    return actionsContainer;
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement("div");
    emptyMessage.className =
      "col-span-full text-center p-8 text-base-content/50";
    emptyMessage.innerHTML = `
      <i class="ri-emotion-sad-line text-4xl mb-2"></i>
      <p>${this.config.emptyMessage}</p>
    `;
    this.grid.appendChild(emptyMessage);
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.config.data.length / this.config.itemsPerPage
    );

    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    this.paginationInfo.textContent = `Page ${this.currentPage} sur ${totalPages} • ${this.config.data.length} produits`;
  }

  setupEvents() {
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

  render() {
    return this.container;
  }

  cleanup() {
    // Cleanup si nécessaire
  }
}
