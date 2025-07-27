import { Modal } from "../../components/modal/Modal.js";
import { validators } from "../../utils/Validator.js";

export class AbstractDetteModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("client_dette");
    this.produitController = app.getController("client_produit");
    this.config = config;
    this.init();
  }

  init() {
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    return `
      <div class="bg-white text-gray-700 rounded-lg p-4 shadow-md max-w-2xl mx-auto">
        <h2 class="text-xl font-semibold mb-4">Nouvelle demande de dette</h2>
        
        <input type="text" id="searchProduit" placeholder="Rechercher un produit..." 
               class="w-full border p-2 rounded mb-3" />

        <ul id="produitSuggestions" class="border rounded mb-4 max-h-40 overflow-y-auto"></ul>

        <div id="selectedProduitsList" class="space-y-2 mb-4"></div>

        <div class="flex justify-between items-center font-bold">
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

  getSubmitButtonText() {
    return "Soumettre";
  }

  setupValidation() {
    this.fields = {
      id_client: {
        value: "",
        error: "",
        validator: (v) => validators.required(v) || "Client requis",
      },
      id_boutiquier: {
        value: "",
        error: "",
        validator: (v) => validators.required(v) || "Boutiquier requis",
      },
      montant: {
        value: "",
        error: "",
        validator: (v) =>
          (validators.required(v) && v > 0) || "Montant invalide",
      },
    };
  }

  setupEvents() {
    // this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    // Object.keys(this.fields).forEach((name) => {
    //   const input = this.form.querySelector(`[name="${name}"]`);
    //   input.addEventListener("input", () => {
    //     if (this.fields[name].error) {
    //       this.clearError(name);
    //     }
    //   });
    // });
    // super.setupEvents();

    const searchInput = this.form.querySelector("#searchProduit");
    const suggestionList = this.form.querySelector("#produitSuggestions");

    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      suggestionList.innerHTML = "";
      if (!term) return;

      const filtered = this.produits.filter(
        (p) =>
          p.nom.toLowerCase().includes(term) &&
          !this.selectedProduits.find((sp) => sp.id === p.id)
      );

      for (const produit of filtered) {
        const li = document.createElement("li");
        li.textContent = produit.nom;
        li.className = "cursor-pointer p-2 hover:bg-gray-200";
        li.addEventListener("click", () => {
          this.addProduit(produit);
          searchInput.value = "";
          suggestionList.innerHTML = "";
        });
        suggestionList.appendChild(li);
      }
    });
  }

  addProduit(produit) {
    produit.quantiteDemandee = 1;
    this.selectedProduits.push(produit);
    this.renderSelectedProduits();
  }

  validateForm() {
    let isValid = true;
    Object.keys(this.fields).forEach((field) => {
      const input = this.form.querySelector(`[name="${field}"]`);
      const value = input.value;
      const error = this.fields[field].validator(value);
      this.fields[field].value = value;
      this.fields[field].error = typeof error === "string" ? error : "";
      const errorEl = this.form.querySelector(`[data-error="${field}"]`);
      errorEl.textContent = this.fields[field].error;
      errorEl.classList.toggle("hidden", !this.fields[field].error);
      input.classList.toggle("input-error", !!this.fields[field].error);
      if (this.fields[field].error) isValid = false;
    });
    return isValid;
  }

  // async handleSubmit(e) {
  //   e.preventDefault();
  //   if (!this.validateForm()) return;
  //   this.modal.setButtonLoading("submit", true);
  //   try {
  //     const data = {
  //       id_client: this.fields.id_client.value,
  //       id_boutiquier: this.fields.id_boutiquier.value,
  //       montant: Number(this.fields.montant.value),
  //       date_demande: new Date().toISOString().split("T")[0],
  //       statut: "en_attente",
  //     };
  //     await this.processFormData(data);
  //     this.close();
  //   } catch (error) {
  //     this.app.services.notifications.show(error.message || "Erreur lors de l'envoi", "error");
  //   } finally {
  //     this.modal.setButtonLoading("submit", false);
  //   }
  // }

  async handleSubmit(e) {
    e.preventDefault();
   

    if (this.selectedProduits.length === 0) {
      this.app.services.notifications.show(
        "Veuillez ajouter au moins un produit",
        "error"
      );
      return;
    }

    this.modal.setButtonLoading("submit", true, "Envoi en cours...");

    try {
      const dette = {
        date_demande: new Date().toISOString().split("T")[0],
        statut: "en_attente",
        produits: this.selectedProduits.map((p) => ({
          id: p.id,
          nom: p.nom,
          prix: p.prix,
          quantite: p.quantiteDemandee,
          sousTotal: p.prix * p.quantiteDemandee,
        })),
        montant: this.getMontantTotal(),
      };
      
      
      if (this.config.onSubmit) {
        await this.config.onSubmit(dette);
      }

      this.processFormData(dette);

      this.close();
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.modal.setButtonLoading("submit", false);
    }
  }

  renderSelectedProduits() {
    const listContainer = this.form.querySelector("#selectedProduitsList");
    const totalSpan = this.form.querySelector("#montantTotal");

    listContainer.innerHTML = "";

    for (const produit of this.selectedProduits) {
      const div = document.createElement("div");
      div.className = "flex items-center gap-2";

      div.innerHTML = `
        <span class="flex-1">${produit.nom}</span>
        <input type="number" min="1" max="${produit.quantite}" 
               value="${produit.quantiteDemandee}" 
               class="w-20 border p-1 rounded" />
        <span class="w-24 text-right">${
          produit.prix * produit.quantiteDemandee
        } FCFA</span>
        <button class="text-red-500 font-bold">X</button>
      `;

      const input = div.querySelector("input");
      const btn = div.querySelector("button");

      input.addEventListener("input", (e) => {
        let val = parseInt(e.target.value);
        if (val > produit.quantite) val = produit.quantite;
        if (val < 1) val = 1;
        produit.quantiteDemandee = val;
        this.renderSelectedProduits();
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

  getMontantTotal() {
    return this.selectedProduits.reduce(
      (sum, p) => sum + p.prix * p.quantiteDemandee,
      0
    );
  }

  async processFormData(data) {
    throw new Error("processFormData() doit être implémenté.");
  }

  open() {
    this.form.reset();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  clearError(name) {
    const errorEl = this.form.querySelector(`[data-error="${name}"]`);
    const input = this.form.querySelector(`[name="${name}"]`);
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
    input.classList.remove("input-error");
  }

  initForm() {
    this.selectedProduits = [];

    // Exemple : tu récupères tous les produits depuis le controller
    this.produitController.loadProduits().then((produits) => {
      this.produits = produits;
    });
  }
}
