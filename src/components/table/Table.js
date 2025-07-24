export class ModernTable {
  constructor(config) {
    this.config = {
      columns: [],
      data: [],
      itemsPerPageOptions: [5, 10, 25, 50],
      itemsPerPage: 10,
      tableId: `table-${Math.random().toString(36).substr(2, 8)}`,
      actions: null,
      onAction: null,
      onRowClick: null, // Nouvelle prop pour le clic sur une ligne
      emptyMessage: "Aucune donnée disponible",
      searchable: false,
      sortable: false,
      selectable: false,
      rowClickable: false,
      striped: true,
      hoverEffect: true,
      compact: false,
      bordered: false,
      loading: false,
      initialData: [],
      loadingMessage: "Chargement en cours...",
      hiddenColumns: [], // Colonnes masquées par défaut
      filters: {}, // Filtres multi-colonnes
      rowClass: null, // Fonction pour customiser les classes des lignes
      ...config,
    };

    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = "asc";
    this.selectedRows = new Set();
    this.container = null;
    this.table = null;
    this.searchInput = null;
    this.eventListeners = []; // Pour stocker les listeners pour le destroy
    this.init();
  }

  init() {
    this.createTableContainer();
    this.createSearchBar();
    this.createColumnVisibilityControls(); // Nouveau: contrôles de visibilité des colonnes
    this.createTable();
    this.createPagination();
    this.setupEvents();
    this.update(this.config.data);
  }

  destroy() {
    // Nettoyage de tous les event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.eventListeners = [];

    // Suppression du conteneur si nécessaire
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  async getDom() {
    await Promise.resolve(); // ou `await new Promise(r => requestAnimationFrame(r))`
    return this.container;
  }

  createTableContainer() {
    this.container = document.createElement("div");
    this.container.className =
      "bg-base-100 rounded-box shadow-sm border border-base-200 overflow-hidden relative";
    this.container.id = `${this.config.tableId}-container`;
  }

  createSearchBar() {
    if (!this.config.searchable) return;

    const searchContainer = document.createElement("div");
    searchContainer.className = "p-4 border-b border-base-200 bg-base-100";

    const searchWrapper = document.createElement("div");
    searchWrapper.className = "relative max-w-xs";

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Rechercher...";
    this.searchInput.className = "input input-bordered input-sm w-full pl-8";
    this.searchInput.id = `${this.config.tableId}-search`;

    const searchIcon = document.createElement("span");
    searchIcon.className =
      "absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50";
    searchIcon.innerHTML = '<i class="ri-search-line"></i>';

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(this.searchInput);
    searchContainer.appendChild(searchWrapper);
    this.container.appendChild(searchContainer);
  }

  createColumnVisibilityControls() {
    if (this.config.columns.length <= 1) return;

    const controlsContainer = document.createElement("div");
    controlsContainer.className =
      "p-2 border-b border-base-200 bg-base-100 flex flex-wrap gap-2";

    const label = document.createElement("span");
    label.className = "text-sm text-base-content/70 self-center";
    label.textContent = "Colonnes:";
    controlsContainer.appendChild(label);

    this.config.columns.forEach((column, index) => {
      if (column.hideable === false) return;

      const wrapper = document.createElement("div");
      wrapper.className = "form-control";

      const label = document.createElement("label");
      label.className = "label cursor-pointer gap-2";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "checkbox checkbox-xs";
      input.checked = !this.config.hiddenColumns.includes(column.key);
      input.dataset.columnKey = column.key;

      const text = document.createElement("span");
      text.className = "label-text text-sm";
      text.textContent = column.header || column.key;

      label.appendChild(input);
      label.appendChild(text);
      wrapper.appendChild(label);
      controlsContainer.appendChild(wrapper);

      this.addEvent(input, "change", (e) =>
        this.toggleColumnVisibility(column.key, e.target.checked)
      );
    });

    this.container.appendChild(controlsContainer);
  }

  toggleColumnVisibility(columnKey, visible) {
    if (visible) {
      this.config.hiddenColumns = this.config.hiddenColumns.filter(
        (k) => k !== columnKey
      );
    } else if (!this.config.hiddenColumns.includes(columnKey)) {
      this.config.hiddenColumns.push(columnKey);
    }

    // Mise à jour des colonnes dans le header
    const headers = this.table.querySelectorAll("th");
    this.config.columns.forEach((column, index) => {
      const headerIndex = index + (this.config.selectable ? 1 : 0);
      if (headers[headerIndex]) {
        headers[headerIndex].style.display = this.config.hiddenColumns.includes(
          column.key
        )
          ? "none"
          : "";
      }
    });

    // Mise à jour des cellules dans le body
    const rows = this.table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      this.config.columns.forEach((column, index) => {
        const cellIndex = index + (this.config.selectable ? 1 : 0);
        if (cells[cellIndex]) {
          cells[cellIndex].style.display = this.config.hiddenColumns.includes(
            column.key
          )
            ? "none"
            : "";
        }
      });
    });
  }

  createTable() {
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "overflow-x-auto";

    this.table = document.createElement("table");
    this.table.className = [
      "table",
      this.config.compact ? "table-sm" : "",
      this.config.striped ? "table-zebra" : "",
      this.config.hoverEffect ? "hover" : "",
      this.config.bordered ? "table-bordered" : "",
      "w-full",
    ]
      .filter(Boolean)
      .join(" ");
    this.table.id = this.config.tableId;

    // Create header
    const thead = document.createElement("thead");
    thead.className = "bg-base-200";

    // Header row
    const headerRow = document.createElement("tr");

    if (this.config.selectable) {
      const selectAllTh = document.createElement("th");
      selectAllTh.style.width = "30px";
      selectAllTh.innerHTML = `
          <label class="cursor-pointer flex items-center justify-center">
            <input type="checkbox" class="checkbox checkbox-xs select-all">
          </label>
        `;
      headerRow.appendChild(selectAllTh);
    }

    this.config.columns.forEach((column) => {
      if (this.config.hiddenColumns.includes(column.key)) return;

      const th = document.createElement("th");
      th.className = [
        "text-base-content/80",
        "font-medium",
        "text-sm",
        this.config.sortable && column.sortable !== false
          ? "cursor-pointer hover:bg-base-300"
          : "",
        column.headerClass || "",
      ]
        .filter(Boolean)
        .join(" ");

      const headerContent = document.createElement("div");
      headerContent.className = "flex items-center gap-2";
      headerContent.textContent = column.header;

      if (this.config.sortable && column.sortable !== false) {
        const sortIcon = document.createElement("span");
        sortIcon.className = "sort-icon text-base-content/50";
        sortIcon.innerHTML = '<i class="ri-arrow-up-down-line text-sm"></i>';
        headerContent.appendChild(sortIcon);
      }

      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });

    if (this.config.actions) {
      const actionsTh = document.createElement("th");
      actionsTh.className = "text-right";
      actionsTh.textContent = "Actions";
      headerRow.appendChild(actionsTh);
    }

    thead.appendChild(headerRow);
    this.table.appendChild(thead);

    // Create body
    const tbody = document.createElement("tbody");
    tbody.id = `${this.config.tableId}-body`;
    this.table.appendChild(tbody);

    tableWrapper.appendChild(this.table);
    this.container.appendChild(tableWrapper);

    // Loading overlay
    if (this.config.loading) {
      this.createLoadingOverlay();
    }
  }

  createLoadingOverlay() {
    const overlay = document.createElement("div");
    overlay.className =
      "absolute inset-0 bg-base-100/80 flex flex-col items-center justify-center gap-2";
    overlay.id = `${this.config.tableId}-loading`;
    overlay.innerHTML = `
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <div class="text-base-content/70">${this.config.loadingMessage}</div>
      `;
    this.container.appendChild(overlay);
  }

  createPagination() {
    const paginationContainer = document.createElement("div");
    paginationContainer.className =
      "flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-base-200";
    paginationContainer.id = `${this.config.tableId}-pagination-container`;

    // Items per page selector
    const itemsPerPageWrapper = document.createElement("div");
    itemsPerPageWrapper.className = "flex items-center gap-2";

    const itemsPerPageLabel = document.createElement("label");
    itemsPerPageLabel.textContent = "Items par page:";
    itemsPerPageLabel.className = "text-sm text-base-content/70";

    const itemsPerPageSelect = document.createElement("select");
    itemsPerPageSelect.className = "select select-bordered select-sm";
    itemsPerPageSelect.id = `${this.config.tableId}-items-per-page`;

    this.config.itemsPerPageOptions.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      opt.selected = option === this.config.itemsPerPage;
      itemsPerPageSelect.appendChild(opt);
    });

    itemsPerPageWrapper.appendChild(itemsPerPageLabel);
    itemsPerPageWrapper.appendChild(itemsPerPageSelect);

    // Pagination info
    const paginationInfo = document.createElement("div");
    paginationInfo.className = "text-sm text-base-content/70";
    paginationInfo.id = `${this.config.tableId}-pagination-info`;

    // Pagination controls
    const paginationControls = document.createElement("div");
    paginationControls.className = "join";

    this.firstBtn = document.createElement("button");
    this.firstBtn.className = "join-item btn btn-sm btn-ghost";
    this.firstBtn.innerHTML = '<i class="ri-skip-back-line"></i>';
    this.firstBtn.disabled = true;

    this.prevBtn = document.createElement("button");
    this.prevBtn.className = "join-item btn btn-sm btn-ghost";
    this.prevBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
    this.prevBtn.disabled = true;

    this.pageInput = document.createElement("input");
    this.pageInput.type = "number";
    this.pageInput.min = "1";
    this.pageInput.className =
      "join-item btn btn-sm btn-ghost w-16 text-center";
    this.pageInput.style.maxWidth = "4rem";
    this.pageInput.id = `${this.config.tableId}-page-input`;

    const pageCountSpan = document.createElement("span");
    pageCountSpan.className =
      "join-item btn btn-sm btn-ghost pointer-events-none";
    pageCountSpan.id = `${this.config.tableId}-page-count`;

    this.nextBtn = document.createElement("button");
    this.nextBtn.className = "join-item btn btn-sm btn-ghost";
    this.nextBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';

    this.lastBtn = document.createElement("button");
    this.lastBtn.className = "join-item btn btn-sm btn-ghost";
    this.lastBtn.innerHTML = '<i class="ri-skip-forward-line"></i>';

    paginationControls.appendChild(this.firstBtn);
    paginationControls.appendChild(this.prevBtn);
    paginationControls.appendChild(this.pageInput);
    paginationControls.appendChild(pageCountSpan);
    paginationControls.appendChild(this.nextBtn);
    paginationControls.appendChild(this.lastBtn);

    paginationContainer.appendChild(itemsPerPageWrapper);
    paginationContainer.appendChild(paginationInfo);
    paginationContainer.appendChild(paginationControls);

    this.container.appendChild(paginationContainer);
  }

  update(data, currentPage = 1) {
    this.currentPage = currentPage;
    this.config.data = Array.isArray(data) ? data : [];

    if (this.config.loading) {
      this.showLoading(false);
    }

    this.renderTableBody();
    this.updatePagination();
    this.setupEvents();
  }

  applyMultiColumnFilters(data) {
    if (!this.config.filters || Object.keys(this.config.filters).length === 0) {
      return data;
    }

    return data.filter((item) => {
      return Object.entries(this.config.filters).every(([key, filter]) => {
        const value = item[key];
        if (filter === null || filter === undefined) return true;

        if (typeof filter === "function") {
          return filter(value, item);
        }

        if (Array.isArray(filter)) {
          return filter.includes(value);
        }

        return value == filter;
      });
    });
  }

  renderTableBody() {
    const tbody = document.getElementById(`${this.config.tableId}-body`);
    if (!tbody) return;

    tbody.innerHTML = "";

    const startIndex = (this.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = startIndex + this.config.itemsPerPage;
    let itemsToShow = this.config.data.slice(startIndex, endIndex);
    console.log("✅ Données reçues par ModernTable:", this.config.data);

    // Apply multi-column filters
    itemsToShow = this.applyMultiColumnFilters(itemsToShow);
    console.log(itemsToShow);

    // Apply search filter if searchable
    if (this.config.searchable && this.searchInput && this.searchInput.value) {
      const searchTerm = this.searchInput.value.toLowerCase();
      itemsToShow = itemsToShow.filter((item) =>
        this.config.columns.some((column) => {
          if (this.config.hiddenColumns.includes(column.key)) return false;
          const value = item[column.key]?.toString().toLowerCase() || "";
          return value.includes(searchTerm);
        })
      );
    }

    // Apply sorting if sortable
    if (this.config.sortable && this.sortColumn) {
      itemsToShow.sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];

        if (typeof valA === "string" && typeof valB === "string") {
          return this.sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return this.sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }

    if (itemsToShow.length === 0) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan =
        this.config.columns.length +
        (this.config.actions ? 1 : 0) +
        (this.config.selectable ? 1 : 0);
      emptyCell.className = "py-8 text-center";
      emptyCell.innerHTML = `
          <div class="flex flex-col items-center gap-2 text-base-content/50">
            <i class="ri-database-2-line text-2xl"></i>
            <span>${this.config.emptyMessage}</span>
          </div>
        `;
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
      return;
    }

    itemsToShow.forEach((item, index) => {
      console.log("ITEM RENDU:", item);
      const row = document.createElement("tr");

      // Appliquer les classes personnalisées pour la ligne
      const rowClasses = [
        this.config.rowClickable ? "hover:bg-base-200 cursor-pointer" : "",
        this.selectedRows.has(item.id) ? "!bg-primary/10" : "",
      ];

      if (this.config.rowClass) {
        const customClasses = this.config.rowClass(item);
        if (customClasses) {
          rowClasses.push(customClasses);
        }
      }

      row.className = rowClasses.filter(Boolean).join(" ");

      if (item.id) {
        row.dataset.id = item.id;
      }

      // Add checkbox for selectable rows
      if (this.config.selectable) {
        const selectCell = document.createElement("td");
        selectCell.className = "text-center";
        selectCell.innerHTML = `
            <label class="cursor-pointer flex items-center justify-center">
              <input type="checkbox" class="checkbox checkbox-xs row-select" data-id="${item.id}">
            </label>
          `;
        row.appendChild(selectCell);
      }

      this.config.columns.forEach((column) => {
        if (this.config.hiddenColumns.includes(column.key)) return;

        const cell = document.createElement("td");
        cell.className = [
          column.className || "",
          column.nowrap ? "whitespace-nowrap" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (column.render) {
          const renderedContent = column.render(item);
          if (typeof renderedContent === "string") {
            cell.innerHTML = renderedContent;
          } else {
            cell.appendChild(renderedContent);
          }
        } else {
          cell.textContent = item[column.key] || "";
        }

        row.appendChild(cell);
      });

      if (this.config.actions) {
        const actionsCell = document.createElement("td");
        actionsCell.className = "text-right space-x-1";
        actionsCell.appendChild(this.renderActions(item));
        row.appendChild(actionsCell);
      }

      tbody.appendChild(row);
    });
  }

  renderActions(item) {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex gap-2 justify-end";

    // Get actions (support both array and function)
    const allActions =
      typeof this.config.actions.items === "function"
        ? this.config.actions.items(item)
        : this.config.actions.items;

    // Filter visible actions
    const visibleActions = allActions.filter(
      (action) => !action.visible || action.visible(item)
    );

    // Get display mode (default to 'auto')
    const displayMode = this.config.actions.displayMode || "auto";

    if (
      displayMode === "dropdown" ||
      (displayMode === "auto" && visibleActions.length > 3)
    ) {
      // Mode dropdown
      return this.createActionsDropdown(item, visibleActions);
    } else {
      // Mode direct (correction ici ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓)
      visibleActions.forEach((action) => {
        actionsContainer.appendChild(this.createActionButton(action, item)); // ✅ bon ordre
      });
      return actionsContainer;
    }
  }

  createActionButton(action, item) {
    const button = document.createElement("button");
    console.log("Création bouton action:", action.name, "pour l’ID:", item.id);

    button.className = `btn btn-sm ${
      typeof action.className === "function"
        ? action.className(item)
        : action.className || ""
    }`;

    button.setAttribute("data-id", item.id);
    button.setAttribute("data-action", action.name);

    const icon =
      typeof action.icon === "function" ? action.icon(item) : action.icon;
    button.innerHTML = `<i class="${icon}"></i>`;

    button.onclick = (e) => {
      e.stopPropagation();
      const actionType =
        typeof action.action === "function" ? action.action(item) : null;

      this.config.onAction?.(action.name, item.id, actionType);
    };

    return button;
  }

  createActionsDropdown(item, actions) {
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "dropdown dropdown-end";

    // Dropdown trigger
    const dropdownTrigger = document.createElement("button");
    dropdownTrigger.className = "btn btn-sm btn-ghost";
    dropdownTrigger.innerHTML = `<i class="ri-more-2-fill"></i>`;

    // Dropdown menu
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className =
      "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52";

    // Add actions to dropdown
    actions.forEach((action) => {
      const li = document.createElement("li");

      // ✅ Appel corrigé ici : action d'abord, puis item
      const actionButton = this.createActionButton(action, item);

      // Retirer btn-sm si nécessaire
      actionButton.className = actionButton.className.replace("btn-sm", "");
      li.appendChild(actionButton);
      dropdownMenu.appendChild(li);
    });

    dropdownContainer.appendChild(dropdownTrigger);
    dropdownContainer.appendChild(dropdownMenu);

    return dropdownContainer;
  }

  updatePagination() {
    const totalItems = this.config.data.length;
    const totalPages = Math.ceil(totalItems / this.config.itemsPerPage) || 1;

    // Safely update page input if it exists
    if (this.pageInput) {
      this.pageInput.value = this.currentPage;
      this.pageInput.max = totalPages;
    }

    // Safely update page count if element exists
    const pageCountElement = document.getElementById(
      `${this.config.tableId}-page-count`
    );
    if (pageCountElement) {
      pageCountElement.textContent = totalPages;
    }

    // Update button states if buttons exist
    if (this.firstBtn && this.prevBtn && this.nextBtn && this.lastBtn) {
      this.firstBtn.disabled = this.currentPage === 1;
      this.prevBtn.disabled = this.currentPage === 1;
      this.nextBtn.disabled =
        this.currentPage === totalPages || totalPages === 0;
      this.lastBtn.disabled =
        this.currentPage === totalPages || totalPages === 0;
    }

    // Update pagination info if element exists
    const info = document.getElementById(
      `${this.config.tableId}-pagination-info`
    );
    if (info) {
      const startItem =
        totalItems > 0
          ? (this.currentPage - 1) * this.config.itemsPerPage + 1
          : 0;
      const endItem = Math.min(
        this.currentPage * this.config.itemsPerPage,
        totalItems
      );

      info.innerHTML = `
            Affichage de <span class="font-medium">${startItem}-${endItem}</span> sur 
            <span class="font-medium">${totalItems}</span> éléments
        `;
    }
  }

  setupEvents() {
    this.setupRowClickEvents();
    this.setupActionEvents();
    this.setupSortEvents();
    this.setupPaginationEvents();
    this.setupSelectionEvents();
    this.setupSearchEvents();
  }

  setupRowClickEvents() {
    const tbody = document.getElementById(`${this.config.tableId}-body`);
    if (!tbody) return;

    if (
      this.config.rowClickable &&
      (this.config.onRowClick || this.config.onAction)
    ) {
      this.addEvent(tbody, "click", (e) => {
        const row = e.target.closest("tr");
        if (
          row &&
          !e.target.closest(".actions-cell") &&
          !e.target.closest(".select-cell")
        ) {
          const id = row.dataset.id;
          if (this.config.onRowClick) {
            this.config.onRowClick(id);
          } else if (this.config.onAction) {
            this.config.onAction("row-click", id);
          }
        }
      });
    }
  }

  setupActionEvents() {
    const tbody = document.getElementById(`${this.config.tableId}-body`);
    if (!tbody || !this.config.onAction) return;

    this.addEvent(tbody, "click", (e) => {
      const actionItem = e.target.closest("[data-action]");
      if (actionItem) {
        e.preventDefault();
        e.stopPropagation();
        this.config.onAction(actionItem.dataset.action, actionItem.dataset.id);
      }
    });
  }

  setupSortEvents() {
    if (!this.config.sortable || !this.table) return;

    const sortableHeaders = this.table.querySelectorAll(
      "th[class*='cursor-pointer']"
    );
    sortableHeaders.forEach((header) => {
      this.addEvent(header, "click", () => {
        const columnIndex =
          Array.from(header.parentNode.children).indexOf(header) -
          (this.config.selectable ? 1 : 0);
        const column = this.config.columns[columnIndex];

        if (column && column.sortable !== false) {
          if (this.sortColumn === column.key) {
            this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
          } else {
            this.sortColumn = column.key;
            this.sortDirection = "asc";
          }

          // Update sort indicators
          sortableHeaders.forEach((h) => {
            const sortIcon = h.querySelector(".sort-icon");
            if (sortIcon) {
              sortIcon.innerHTML =
                '<i class="ri-arrow-up-down-line text-sm"></i>';
            }
          });

          const sortIcon = header.querySelector(".sort-icon");
          if (sortIcon) {
            sortIcon.innerHTML =
              this.sortDirection === "asc"
                ? '<i class="ri-arrow-up-line text-sm"></i>'
                : '<i class="ri-arrow-down-line text-sm"></i>';
          }

          this.renderTableBody();
        }
      });
    });
  }

  setupPaginationEvents() {
    if (
      !this.firstBtn ||
      !this.prevBtn ||
      !this.nextBtn ||
      !this.lastBtn ||
      !this.pageInput
    )
      return;

    this.addEvent(this.firstBtn, "click", () => {
      this.currentPage = 1;
      this.update(this.config.data, this.currentPage);
    });

    this.addEvent(this.prevBtn, "click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.update(this.config.data, this.currentPage);
      }
    });

    this.addEvent(this.nextBtn, "click", () => {
      const totalPages = Math.ceil(
        this.config.data.length / this.config.itemsPerPage
      );
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.update(this.config.data, this.currentPage);
      }
    });

    this.addEvent(this.lastBtn, "click", () => {
      const totalPages = Math.ceil(
        this.config.data.length / this.config.itemsPerPage
      );
      this.currentPage = totalPages;
      this.update(this.config.data, this.currentPage);
    });

    this.addEvent(this.pageInput, "change", (e) => {
      const totalPages = Math.ceil(
        this.config.data.length / this.config.itemsPerPage
      );
      let page = parseInt(e.target.value);

      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      this.currentPage = page;
      this.update(this.config.data, this.currentPage);
    });

    // Items per page change
    const itemsPerPageSelect = document.getElementById(
      `${this.config.tableId}-items-per-page`
    );

    if (itemsPerPageSelect) {
      this.addEvent(itemsPerPageSelect, "change", (e) => {
        this.config.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.update(this.config.data, this.currentPage);
      });
    }
  }

  setupSelectionEvents() {
    if (!this.config.selectable || !this.table) return;

    const tbody = document.getElementById(`${this.config.tableId}-body`);
    if (!tbody) return;

    // Select all checkbox
    const selectAll = this.table.querySelector(".select-all");
    if (selectAll) {
      this.addEvent(selectAll, "change", (e) => {
        const isChecked = e.target.checked;
        const checkboxes = tbody.querySelectorAll(".row-select");

        checkboxes.forEach((checkbox) => {
          checkbox.checked = isChecked;
          const row = checkbox.closest("tr");
          const id = checkbox.dataset.id;

          if (isChecked) {
            this.selectedRows.add(id);
            row.classList.add("!bg-primary/10");
          } else {
            this.selectedRows.delete(id);
            row.classList.remove("!bg-primary/10");
          }
        });

        if (this.config.onAction) {
          this.config.onAction(
            "selection-change",
            Array.from(this.selectedRows)
          );
        }
      });
    }

    // Individual row selection
    this.addEvent(tbody, "change", (e) => {
      const checkbox = e.target.closest(".row-select");
      if (checkbox) {
        const row = checkbox.closest("tr");
        const id = checkbox.dataset.id;

        if (checkbox.checked) {
          this.selectedRows.add(id);
          row.classList.add("!bg-primary/10");
        } else {
          this.selectedRows.delete(id);
          row.classList.remove("!bg-primary/10");
        }

        // Update select all checkbox
        const selectAll = this.table.querySelector(".select-all");
        if (selectAll) {
          const allChecked =
            tbody.querySelectorAll(".row-select:checked").length ===
            tbody.querySelectorAll(".row-select").length;
          selectAll.checked = allChecked;
          selectAll.indeterminate = !allChecked && this.selectedRows.size > 0;
        }

        if (this.config.onAction) {
          this.config.onAction(
            "selection-change",
            Array.from(this.selectedRows)
          );
        }
      }
    });
  }

  setupSearchEvents() {
    if (!this.config.searchable || !this.searchInput) return;

    this.addEvent(this.searchInput, "input", () => {
      this.currentPage = 1;
      this.renderTableBody();
      this.updatePagination();
    });
  }

  addEvent(element, type, listener) {
    element.addEventListener(type, listener);
    this.eventListeners.push({ element, type, listener });
  }

  createDropdownMenu(actions, item) {
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "dropdown dropdown-end dropdown-hover";

    const trigger = document.createElement("button");
    trigger.className = "btn btn-sm btn-ghost btn-square";
    trigger.innerHTML = '<i class="ri-more-2-fill"></i>';

    const menu = document.createElement("ul");
    menu.className =
      "dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52";
    menu.tabIndex = 0;

    actions.forEach((action) => {
      const li = document.createElement("li");

      // ✅ Corrigé : on passe bien (action, item) dans cet ordre
      const btn = this.createActionButton(action, item);

      // Nettoyage des classes si besoin
      btn.className = btn.className.replace("btn-square", "");
      li.appendChild(btn);
      menu.appendChild(li);
    });

    dropdownContainer.appendChild(trigger);
    dropdownContainer.appendChild(menu);

    return dropdownContainer;
  }

  showLoading(show = true) {
    const overlay = document.getElementById(`${this.config.tableId}-loading`);
    if (overlay) {
      overlay.style.display = show ? "flex" : "none";
    }
  }

  render() {
    return this.container;
  }

  getSelectedRows() {
    return Array.from(this.selectedRows);
  }

  clearSelection() {
    this.selectedRows.clear();
    const checkboxes = this.table?.querySelectorAll(".row-select");
    checkboxes?.forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.closest("tr")?.classList.remove("!bg-primary/10");
    });

    const selectAll = this.table?.querySelector(".select-all");
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
  }

  // Méthode pour ajouter des filtres
  setFilters(filters) {
    this.config.filters = { ...this.config.filters, ...filters };
    this.currentPage = 1;
    this.renderTableBody();
    this.updatePagination();
  }

  // Méthode pour effacer les filtres
  clearFilters() {
    this.config.filters = {};
    this.currentPage = 1;
    this.renderTableBody();
    this.updatePagination();
  }

  set data(newData) {
    this.config.data = Array.isArray(newData) ? newData : [];
    this.update(this.config.data, 1);
  }
}
