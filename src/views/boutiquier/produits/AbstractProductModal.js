import { Modal } from "../../../components/modal/Modal.js";
import { validators } from "../../../utils/Validator.js";

export class AbstractProductModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("product");
    this.config = config;
    this.articles = [];
    // this.init();
  }

  async open() {
    await this.init();
    this.modal.open();
  }

  async init() {
    await this.loadArticles();
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
  }

  async loadArticles() {
    try {
      this.articles = await this.controller.loadArticles();
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      this.app.services.notifications.show(
        "Erreur lors du chargement des articles",
        "error"
      );
    }
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nom du produit -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Nom du produit <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="nom" class="input input-bordered input-primary" required minlength="2" maxlength="100">
          <div data-error="nom" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Article associé -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Article associé
            </span>
          </label>
          <select 
            name="article_id" 
            class="select select-bordered"
          >
            <option value="">Aucun article associé</option>
            ${this.articles
              .map(
                (article) => `
              <option value="${article.id}">${article.titre}</option>
            `
              )
              .join("")}
          </select>
          <div data-error="article_id" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Prix -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Prix (FCFA) <span class="text-error">*</span>
            </span>
          </label>
          <div class="relative">
            <input 
              type="number" 
              name="prix" 
              class="input input-bordered input-primary pl-12" 
              min="100" 
              step="50" 
              required
            >
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
          <div data-error="prix" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Quantité -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Quantité en stock <span class="text-error">*</span>
            </span>
          </label>
          <input 
            type="number" 
            name="quantite" 
            class="input input-bordered input-primary" 
            min="0" 
            required
          >
          <div data-error="quantite" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Seuil d'alerte -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Seuil d'alerte stock
            </span>
          </label>
          <input 
            type="number" 
            name="seuil_alerte" 
            class="input input-bordered input-primary" 
            min="1"
          >
          <div class="text-xs text-gray-500 mt-1">Notification quand le stock atteint ce niveau</div>
          <div data-error="seuil_alerte" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Image du produit -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">Image du produit</span>
          </label>
          <div class="flex items-center gap-4">
            <div class="avatar-preview w-32 h-32 rounded-lg bg-gray-200 overflow-hidden hidden">
              <img id="product-image-preview" class="w-full h-full object-cover" src="" alt="Preview">
            </div>
            <label class="btn btn-outline btn-primary cursor-pointer">
              <i class="ri-upload-line mr-2"></i>
              Choisir une image
              <input 
                type="file" 
                accept="image/*" 
                name="image" 
                class="hidden" 
                id="product-image-upload"
              >
            </label>
          </div>
          <div data-error="image" class="text-error text-sm mt-1 hidden"></div>
        </div>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Produit",
      content: this.form,
      size: "xl",
      footerButtons: this.getFooterButtons(),
    });
  }

  getFooterButtons() {
    return [
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
    ];
  }

  getSubmitButtonText() {
    return "Valider";
  }

  initForm() {
    // À implémenter dans les classes enfants si nécessaire
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form
      .querySelector("#product-image-upload")
      ?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const preview = this.form.querySelector("#product-image-preview");
            const previewContainer = this.form.querySelector(".avatar-preview");

            preview.src = event.target.result;
            previewContainer.classList.remove("hidden");
          };
          reader.readAsDataURL(file);
        }
      });

    this.form.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input.name));
      input.addEventListener("input", () => {
        if (this.fields[input.name]?.error) {
          this.clearError(input.name);
        }
      });
    });
  }

  setupValidation() {
    this.fields = {
      nom: {
        value: "",
        error: "",
        validator: (v) =>
          validators.required(v) || "Le nom du produit est requis",
      },
      article_id: {
        value: "",
        error: "",
        validator: (v) => true, // Optionnel - pas de validation nécessaire
      },
      prix: {
        value: "",
        error: "",
        validator: (v) =>
          validators.required(v) ||
          validators.minValue(v, 100) ||
          "Le prix minimum est 100 FCFA",
      },
      quantite: {
        value: "",
        error: "",
        validator: (v) =>
          validators.required(v) ||
          validators.minValue(v, 0) ||
          "La quantité ne peut pas être négative",
      },
      seuil_alerte: {
        value: "",
        error: "",
        validator: (v) =>
          !v || validators.minValue(v, 1) || "Le seuil doit être au moins 1",
      },
      image: {
        value: "",
        error: "",
        validator: (v) =>
          !v ||
          validators.fileType(v, ["image/jpeg", "image/png", "image/webp"]) ||
          "Formats acceptés: JPG, PNG, WEBP",
      },
    };
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.modal.setButtonLoading("submit", true, this.getLoadingText());

    try {
      const formData = await this.getFormData();
      await this.processFormData(formData);
      this.close();
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.modal.setButtonLoading("submit", false);
    }
  }

  getLoadingText() {
    return "Enregistrement...";
  }

  async getFormData() {
    const formData = new FormData(this.form);
    const file = this.form.querySelector('[name="image"]').files[0];
    const imageBase64 = file
      ? await this.convertToBase64(file)
      : this.config.product?.image || null;

    return {
      nom: formData.get("nom"),
      article_id: formData.get("article_id") || null,
      prix: parseInt(formData.get("prix")),
      quantite: parseInt(formData.get("quantite")),
      seuil_alerte: formData.get("seuil_alerte")
        ? parseInt(formData.get("seuil_alerte"))
        : 5,
      image: imageBase64,
      id_boutiquier: this.app.store.state.user.id,
    };
  }

  async processFormData(formData) {
    throw new Error("Method 'processFormData' must be implemented");
  }

  handleSubmitError(error) {
    console.error("Erreur formulaire:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  validateForm() {
    let isValid = true;
    Object.keys(this.fields).forEach((field) => {
      this.validateField(field);
      if (this.fields[field].error) isValid = false;
    });
    return isValid;
  }

  convertToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) resolve(null);

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  }

  validateField(name) {
    if (!this.fields[name]) return;

    const input = this.form.querySelector(`[name="${name}"]`);
    if (!input) return;

    const value = input.type === "file" ? input.files[0] : input.value;
    this.fields[name].value = value;

    const error = this.fields[name].validator(value);
    this.fields[name].error = typeof error === "string" ? error : "";

    this.displayError(name);
  }

  displayError(name, customError = null) {
    const error = customError || this.fields[name]?.error;
    const errorElement = this.form.querySelector(`[data-error="${name}"]`);
    const input = this.form.querySelector(`[name="${name}"]`);

    if (errorElement) {
      errorElement.textContent = error || "";
      errorElement.classList.toggle("hidden", !error);
    }

    if (input) {
      input.classList.toggle("input-error", !!error);
    }
  }

  clearError(name) {
    this.displayError(name, "");
  }

  close() {
    if (this.modal) {
      this.modal.close();
    }
  }
}