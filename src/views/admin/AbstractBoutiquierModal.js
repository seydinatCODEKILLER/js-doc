import { Modal } from "../../components/modal/Modal.js";
import { validators } from "../../utils/Validator.js";

export class AbstractBoutiquierModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("admin");
    this.service = app.getService("admins");
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nom -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Nom <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="nom" class="input input-bordered input-primary" required>
          <div data-error="nom" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Prénom -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Prénom <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="prenom" class="input input-bordered input-primary" required>
          <div data-error="prenom" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Email -->
        <div class="form-control flex flex-col">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Email <span class="text-error">*</span>
            </span>
          </label>
          <input type="email" name="email" class="input input-bordered input-primary" required>
          <div data-error="email" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Téléphone -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Téléphone</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2">+221</span>
            <input type="tel" name="telephone" class="input input-bordered input-primary pl-12" 
                   pattern="[0-9]{9}" maxlength="9" placeholder="612345678">
          </div>
          <div data-error="telephone" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Mot de passe -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Mot de passe <span class="text-error">*</span>
            </span>
          </label>
          <div class="relative">
            <input type="password" name="password" 
                   class="input input-bordered input-primary w-full" 
                   ${
                     this.config.requirePassword ? "required" : ""
                   } minlength="8">
            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 toggle-password">
              <i class="ri-eye-line"></i>
            </button>
          </div>
          <div class="text-xs mt-1 text-gray-500">
            Minimum 8 caractères avec majuscule, minuscule et chiffre
          </div>
          <div data-error="password" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Avatar -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">Photo de profil</span>
          </label>
          <div class="flex items-center gap-4">
            <div class="avatar-preview w-16 h-16 rounded-full bg-gray-200 overflow-hidden hidden">
              <img id="avatar-preview" class="w-full h-full object-cover" src="" alt="Preview">
            </div>
            <label class="btn btn-outline btn-primary cursor-pointer">
              <i class="ri-upload-line mr-2"></i>
              Choisir une image
              <input type="file" accept="image/*" name="avatar" 
                     class="hidden" id="avatar-upload">
            </label>
          </div>
          <div data-error="avatar" class="text-error text-sm mt-1 hidden"></div>
        </div>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Boutiquier",
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
    return "Valider"; // À surcharger dans les classes enfants
  }

  initForm() {
    // À implémenter dans les classes enfants si nécessaire
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form
      .querySelector(".toggle-password")
      ?.addEventListener("click", (e) => {
        const passwordInput = this.form.querySelector('[name="password"]');
        const icon = e.currentTarget.querySelector("i");
        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";
        icon.className = isPassword ? "ri-eye-off-line" : "ri-eye-line";
      });

    this.form
      .querySelector("#avatar-upload")
      ?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const preview = this.form.querySelector("#avatar-preview");
            const previewContainer = this.form.querySelector(".avatar-preview");

            preview.src = event.target.result;
            previewContainer.classList.remove("hidden");
          };
          reader.readAsDataURL(file);
        }
      });

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
      nom: {
        value: "",
        error: "",
        validator: (v) => validators.required(v) || "Le nom est requis",
      },
      prenom: {
        value: "",
        error: "",
        validator: (v) => validators.required(v) || "Le prénom est requis",
      },
      email: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!validators.required(v)) return "L'email est requis";
          if (!validators.email(v)) return "Format email invalide";

          const currentEmail = this.config?.boutiquier?.email || null;
          if (currentEmail && currentEmail.toLowerCase() === v.toLowerCase()) {
            return true;
          }

          return await validators.isUnique(
            v,
            this.service.emailExists.bind(this.service),
            "email"
          );
        },
      },
      telephone: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!v) return true;
          if (!validators.senegalPhone(v)) {
            return "Téléphone invalide (ex: 77XXXXXXX)";
          }

          const formattedPhone = `+221${v}`;
          const currentPhone = this.config?.boutiquier?.telephone || null;
          if (formattedPhone === currentPhone) {
            return true;
          }

          return await validators.isUnique(
            formattedPhone,
            this.service.phoneExists.bind(this.service),
            "telephone"
          );
        },
      },
      password: {
        value: "",
        error: "",
        validator: (v) =>
          !v ||
          !this.config.requirePassword ||
          validators.minLength(v, 8) ||
          validators.passwordComplexity(v) ||
          "Le mot de passe doit contenir 8 caractères avec majuscule, minuscule et chiffre",
      },
      avatar: {
        value: "",
        error: "",
        validator: (v) =>
          !v ||
          validators.fileType(v, ["image/jpeg", "image/png"]) ||
          "Seuls les JPG/PNG sont acceptés",
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
    return "Enregistrement..."; // À surcharger si nécessaire
  }

  async getFormData() {
    const formData = new FormData(this.form);
    const file = this.form.querySelector('[name="avatar"]').files[0];
    let avatarUrl = this.config.boutiquier?.avatar || null;
    if (file) {
      const cloudinaryService = this.app.getService("cloudinary");
      const uploadResult = await cloudinaryService.uploadImage(file);
      avatarUrl = uploadResult?.url || null;
    }
    return {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      telephone: formData.get("telephone")
        ? `+221${formData.get("telephone")}`
        : null,
      password: formData.get("password"),
      avatar: avatarUrl,
      role: "boutiquier",
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

  convertToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) resolve(null);

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
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

  open() {
    this.form.reset();
    const preview = this.form.querySelector("#avatar-preview");
    const previewContainer = this.form.querySelector(".avatar-preview");
    if (preview && previewContainer) {
      preview.src = "";
      previewContainer.classList.add("hidden");
    }
    Object.keys(this.fields).forEach((field) => this.clearError(field));
    this.initForm();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}
