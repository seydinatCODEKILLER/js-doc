import { AbstractView } from "../AbstractView.js";
import { AuthValidator } from "./AuthValidator.js";

export class AuthView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("Auth");
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "auth-view";

    this.container.innerHTML = `
      <div class="absolute top-2 left-5 flex items-center gap-2">
        <i class="ri-nft-fill text-purple-500 text-xl"></i>
        <p class="text-gray-800 font-medium">E-Boutique</p>
      </div>
        <form id="loginForm" class="w-full md:w-[340px] lg:w-[400px] p-3 mt-4">
        <p class="text-gray-600 text-sm font-medium w-full md:w-90 mb-5">
          Bienvenue sur la plateforme de gestion de dettes ! Connectez-vous pour
          accéder à votre espace personnel
        </p>
        <div class="mb-4">
          <label class="block text-gray-500 font-medium text-sm mb-2">Email</label>
          <div class="relative">
            <input
              type="email"
              id="email"
              placeholder="votre adresse email"
              class="w-full px-3 py-2 border rounded shadow-sm border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            />
            <i class="ri-mail-ai-line absolute right-2 top-2"></i>
          </div>
          <div class="error-message" id="email-error"></div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-500 font-medium text-sm mb-2">Mot de passe</label>
          <div class="relative">
            <input
              type="password"
              id="password"
              placeholder="votre password"
              class="w-full px-3 py-2 border shadow-sm rounded border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            />
            <i class="ri-lock-password-line absolute right-2 top-2"></i>
          </div>
            <div class="error-message" id="password-error"></div>
        </div>
        <button
          type="submit"
          id="loginButton"
          class="w-full btn btn-primary text-white font-medium"
        >
          <span id="buttonText">Se connecter</span>
          <span id="spinner" class="loading loading-spinner hidden"></span>
        </button>
      </form>
    `;

    this.bindFormEvents();
    return this.container;
  }

  bindFormEvents() {
    const form = this.container.querySelector("#loginForm");
    const emailInput = form.email;
    const passwordInput = form.password;

    emailInput.addEventListener("blur", () => this.validateEmail());
    passwordInput.addEventListener("blur", () => this.validatePassword());

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this.validateForm()) return;

      const credentials = {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };

      try {
        this.setButtonLoading(true);
        await this.controller.login(credentials);
      } catch (error) {
        this.setButtonLoading(false);
        this.app.services.notifications.show(error.message, "error");
      }
    });
  }

  validateForm() {
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    return isEmailValid && isPasswordValid;
  }

  validateEmail() {
    const emailInput = this.container.querySelector("#email");
    const errorElement = this.container.querySelector("#email-error");

    const { isValid, message } = AuthValidator.validateEmail(emailInput.value);

    if (!isValid) {
      errorElement.textContent = message;
      errorElement.classList.add("text-red-500");
      emailInput.classList.add("invalid");
      return false;
    }

    errorElement.textContent = "";
    errorElement.classList.remove("text-red-500");
    emailInput.classList.remove("invalid");
    return true;
  }

  validatePassword() {
    const passwordInput = this.container.querySelector("#password");
    const errorElement = this.container.querySelector("#password-error");

    const { isValid, message } = AuthValidator.validatePassword(
      passwordInput.value
    );

    if (!isValid) {
      errorElement.textContent = message;
      errorElement.classList.add("text-red-500");
      passwordInput.classList.add("invalid");
      return false;
    }

    errorElement.textContent = "";
    errorElement.classList.remove("text-red-500");
    passwordInput.classList.remove("invalid");
    return true;
  }

  setButtonLoading(isLoading) {
    const button = this.container.querySelector("#loginButton");
    const spinner = this.container.querySelector("#spinner");
    const buttonText = this.container.querySelector("#buttonText");

    if (!button || !spinner || !buttonText) return;

    button.disabled = isLoading;
    spinner.classList.toggle("hidden", !isLoading);
    buttonText.textContent = isLoading
      ? "Connexion en cours..."
      : "Se connecter";
  }

  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "alert alert-error";
    errorElement.textContent = message;

    const form = this.container.querySelector("#loginForm");
    form.prepend(errorElement);

    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  async getContent() {
    return this.container;
  }
}
