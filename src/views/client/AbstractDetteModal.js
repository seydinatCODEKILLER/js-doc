import { Modal } from "../../components/modal/Modal.js";

export class AbstractDetteModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("client_dette");
    this.produitController = app.getController("client_produit");
    this.config = config;
    this.selectedProduits = [];
    this.produits = [];
    this.init();
  }

  init() {
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.loadProduits();
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4 p-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    return `
    <h2 class="text-xl font-semibold mb-4">${
      this.config.title || "Nouvelle demande de dette"
    }</h2>
    
    <!-- Recherche de produits -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">Rechercher un produit</span>
      </label>
      <div class="relative">
        <input type="text" id="searchProduit" placeholder="Nom du produit..." 
               class="input input-bordered w-full" />
        <div id="produitSuggestions" class="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg hidden max-h-60 overflow-y-auto"></div>
      </div>
    </div>

    <!-- Liste des produits sélectionnés -->
    <div class="mt-4">
      <h4 class="font-medium mb-2">Articles sélectionnés</h4>
      <div id="selectedProduitsList" class="space-y-3"></div>
    </div>

    <!-- Total -->
    <div class="bg-base-200 p-4 rounded-lg mt-4">
      <div class="flex justify-between items-center font-bold text-lg">
        <span>Total :</span>
        <span id="montantTotal">0 FCFA</span>
      </div>
    </div>
  `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Demande de dette",
      content: this.form,
      size: "md",
      footerButtons: [
        {
          text: "Annuler",
          className: "btn-ghost",
          action: "cancel",
          onClick: () => this.close(),
        },
        {
          text: this.getSubmitButtonText(),
          className: "btn-primary",
          action: "submit",
          onClick: (e) => this.handleSubmit(e),
          closeOnClick: false,
        },
      ],
    });
  }

  async loadProduits() {
    try {
      this.produits = await this.produitController.loadProduits();
    } catch (error) {
      this.app.services.notifications.show(
        "Erreur lors du chargement des produits",
        "error"
      );
      console.error("Erreur loadProduits:", error);
    }
  }

  setupValidation() {
    this.fields = {
      produits: {
        value: [],
        error: "",
        validator: (v) => v.length > 0 || "Ajoutez au moins un produit",
      },
    };
  }

  setupEvents() {
    const searchInput = this.form.querySelector("#searchProduit");
    const suggestionList = this.form.querySelector("#produitSuggestions");

    searchInput.addEventListener("input", () =>
      this.handleSearch(searchInput, suggestionList)
    );
    searchInput.addEventListener("focus", () =>
      suggestionList.classList.remove("hidden")
    );
    document.addEventListener("click", (e) => {
      if (!suggestionList.contains(e.target) && e.target !== searchInput) {
        suggestionList.classList.add("hidden");
      }
    });

    this.setupProduitListeners();
  }

  handleSearch(searchInput, suggestionList) {
    const term = searchInput.value.trim().toLowerCase();
    suggestionList.innerHTML = "";

    if (term.length < 2) {
      suggestionList.classList.add("hidden");
      return;
    }

    const filtered = this.produits.filter(
      (p) =>
        p.nom.toLowerCase().includes(term) &&
        !this.selectedProduits.some((sp) => sp.id === p.id) &&
        p.quantite > 0
    );

    if (filtered.length === 0) {
      suggestionList.innerHTML =
        '<div class="p-2 text-gray-500">Aucun produit trouvé</div>';
    } else {
      filtered.forEach((produit) => {
        const item = document.createElement("div");
        item.className =
          "p-2 hover:bg-base-200 cursor-pointer flex justify-between";
        item.innerHTML = `
          <span>${produit.nom}</span>
          <span class="text-primary">${produit.prix} FCFA (${produit.quantite} dispo)</span>
        `;
        item.addEventListener("click", () => {
          this.addProduit(produit);
          searchInput.value = "";
          suggestionList.classList.add("hidden");
        });
        suggestionList.appendChild(item);
      });
    }

    suggestionList.classList.remove("hidden");
  }

  addProduit(produit) {
    const existing = this.selectedProduits.find((p) => p.id === produit.id);

    if (existing) {
      if (existing.quantiteDemandee < produit.quantite) {
        existing.quantiteDemandee += 1;
      }
    } else {
      this.selectedProduits.push({
        ...produit,
        quantiteDemandee: 1,
        sousTotal: produit.prix,
      });
    }

    this.renderSelectedProduits();
    this.fields.produits.value = this.selectedProduits;
    this.validateForm();
  }

  setupProduitListeners() {
    const listContainer = this.form.querySelector("#selectedProduitsList");

    listContainer.addEventListener("input", (e) => {
      const input = e.target;
      if (input.matches('input[type="number"][data-id]')) {
        const id = parseInt(input.getAttribute("data-id"));
        const value = parseInt(input.value) || 1;
        this.updateProduitQuantity(id, value);
      }
    });

    listContainer.addEventListener("click", (e) => {
      const button = e.target.closest('[data-action="remove"]');
      if (!button) return;

      const id = parseInt(button.getAttribute("data-id"));
      this.handleProduitAction("remove", id);
    });
  }

  renderSelectedProduits() {
    const listContainer = this.form.querySelector("#selectedProduitsList");
    const totalSpan = this.form.querySelector("#montantTotal");

    listContainer.innerHTML = "";
    for (const produit of this.selectedProduits) {
      const div = document.createElement("div");
      div.className = "flex items-center gap-2";
      const total = produit.prix * produit.quantiteDemandee;
      div.innerHTML = `
      <span class="flex-1">${produit.nom}</span>
      <input type="number" min="1" max="${produit.quantite}" 
             value="${produit.quantiteDemandee}" 
             class="w-20 border p-1 rounded" />
      <span class="w-24 text-right">${total} FCFA</span>
      <button class="text-red-500 font-bold cursor-pointer"><i class="ri-delete-bin-6-fill"></i></button>
    `;

      const input = div.querySelector("input");
      const btn = div.querySelector("button");

      input.addEventListener("input", (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 1;
        if (val > produit.quantite) val = produit.quantite;
        if (val < 1) val = 1;

        if (produit.quantiteDemandee !== val) {
          produit.quantiteDemandee = val;
          div.querySelector("span.w-24").textContent = `${
            produit.prix * val
          } FCFA`;
          totalSpan.textContent = `${this.getMontantTotal()} FCFA`;
        }
      });

      btn.addEventListener("click", () => {
        this.selectedProduits = this.selectedProduits.filter(
          (p) => p.id !== produit.id
        );
        this.renderSelectedProduits();
      });

      listContainer.appendChild(div);
    }

    totalSpan.textContent = `${this.getMontantTotal()} FCFA`;
  }

  handleProduitAction(action, id) {
    if (action === "remove") {
      this.selectedProduits = this.selectedProduits.filter((p) => p.id !== id);
      this.renderSelectedProduits();
      this.validateForm();
    }
  }

  updateProduitQuantity(id, quantity) {
    const produit = this.selectedProduits.find((p) => p.id === id);
    if (produit) {
      produit.quantiteDemandee = Math.max(
        1,
        Math.min(quantity, produit.quantite)
      );

      this.updateDisplayedValues();
      this.validateForm();
    }
  }

  updateDisplayedValues() {
    const totalSpan = this.form.querySelector("#montantTotal");

    this.selectedProduits.forEach((produit) => {
      const itemElement = this.form
        .querySelector(`[data-id="${produit.id}"]`)
        .closest("div.flex");
      if (itemElement) {
        const subtotalElement = itemElement.querySelector("div.text-right");
        if (subtotalElement) {
          subtotalElement.textContent = `${
            produit.prix * produit.quantiteDemandee
          } FCFA`;
        }
      }
    });

    totalSpan.textContent = `${this.getMontantTotal()} FCFA`;
  }

  validateQuantities() {
    this.selectedProduits.forEach((produit) => {
      if (produit.quantiteDemandee > produit.quantite) {
        produit.quantiteDemandee = produit.quantite;
      } else if (produit.quantiteDemandee < 1) {
        produit.quantiteDemandee = 1;
      }
    });
    this.renderSelectedProduits();
  }

  validateForm() {
    this.fields.produits.value = this.selectedProduits;
    const isValid = this.selectedProduits.length > 0;

    const submitBtn = this.form.querySelector('[action="submit"]');
    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }

    return isValid;
  }

  getMontantTotal() {
    return this.selectedProduits.reduce(
      (total, p) => total + p.prix * p.quantiteDemandee,
      0
    );
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.app.services.notifications.show(
        "Veuillez ajouter au moins un produit",
        "error"
      );
      return;
    }

    this.modal.setButtonLoading("submit", true, "Envoi en cours...");

    try {
      const detteData = {
        produits: this.selectedProduits.map((p) => ({
          id: p.id,
          nom: p.nom,
          prix: p.prix,
          quantite: p.quantiteDemandee,
          sousTotal: p.prix * p.quantiteDemandee,
        })),
        montant: this.getMontantTotal(),
      };

      await this.processFormData(detteData);
      this.close();
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.modal.setButtonLoading("submit", false);
    }
  }

  handleSubmitError(error) {
    console.error("Erreur lors de la soumission:", error);
    this.app.services.notifications.show(
      error.message || "Erreur lors de l'envoi de la demande",
      "error"
    );
  }

  open() {
    this.selectedProduits = [];
    this.form.reset();
    this.modal.open();
    this.renderSelectedProduits();
  }

  close() {
    this.modal.close();
  }

  getSubmitButtonText() {
    return "Soumettre la demande";
  }

  async processFormData(data) {
    throw new Error("La méthode processFormData doit être implémentée");
  }
}
