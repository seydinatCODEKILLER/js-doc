import { Modal } from "../../../components/modal/Modal.js";
import { validators } from "../../../utils/Validator.js";

export class AbstractArticleModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("article");
    this.config = config;
    this.service = app.getService("articles");
    this.init();
  }

  open() {
    this.form.reset();
    Object.keys(this.fields).forEach((field) => this.clearError(field));
    this.initForm();
    this.modal.open();
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nom du produit -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Titre de l'article <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="titre" class="input input-bordered input-primary" required minlength="5" maxlength="100">
          <div data-error="titre" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Contenu de l'article -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Contenu <span class="text-error">*</span>
            </span>
          </label>
          <textarea name="contenu" class="textarea textarea-bordered textarea-primary h-32" required minlength="10" maxlength="2000"></textarea>
          <div data-error="contenu" class="text-error text-sm mt-1 hidden"></div>
        </div>
    </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Article",
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

  initForm() {}

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form.querySelectorAll("input").forEach((input) => {
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
      titre: {
        value: "",
        error: "",
        validator: (v) =>
          validators.required(v) || "Le titre de l'article est requis",
        validator: async (v) => {
          if (!validators.required(v))
            return "Le titre de l'article est requis";

          const currentName = this.config?.article?.titre || null;
          if (currentName && currentName.toLowerCase() === v.toLowerCase()) {
            return true;
          }

          return await validators.isUnique(
            v,
            this.service.nameExists.bind(this.service),
            "ce titre d'article"
          );
        },
      },
      contenu: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "Le contenu est requis";
          if (!validators.minLength(v, 10))
            return "Le contenu doit faire au moins 10 caractères";
          return null;
        },
      },
    };
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!(await this.validateForm())) {
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

    return {
      titre: formData.get("titre"),
      contenu: formData.get("contenu"),
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

  async validateForm() {
    let isValid = true;
    for (const field of Object.keys(this.fields)) {
      await this.validateField(field);
      if (this.fields[field].error) isValid = false;
    }
    return isValid;
  }

  async validateField(name) {
    if (!this.fields[name]) return;

    const input = this.form.querySelector(`[name="${name}"]`);
    if (!input) return;
    const value = input.type === "file" ? input.files[0] : input.value;
    this.fields[name].value = value;

    const result = await this.fields[name].validator(value);
    this.fields[name].error = typeof result === "string" ? result : "";

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
    this.modal.close();
  }
}
