export class AbstractView {
  constructor(app, { params = {}, route = {} } = {}) {
    this.app = app;
    this.params = params;
    this.route = route;
    this.container = null;
    this.domElements = {};
    this.eventListeners = [];
  }

  /**
   * Titre de la page (peut être surchargé)
   */
  get title() {
    return this.route.meta?.title || "Boutique Manager";
  }

  /**
   * Méthode principale de rendu
   */
  async render() {
    // Initialisation du conteneur
    this.container = document.createElement("div");
    this.container.className = this.constructor.name.toLowerCase();

    // Mise à jour du titre
    document.title = this.title;

    // Appel de la méthode setup (à implémenter dans les classes enfants)
    await this.setup();

    return this.container;
  }

  /**
   * Méthode à implémenter par les classes enfants
   */
  async setup() {
    throw new Error("La méthode setup doit être implémentée");
  }

  /**
   * Récupère le contenu à injecter dans le layout
   */
  async getContent() {
    return this.container;
  }

  /**
   * Méthode utilitaire pour querySelector
   */
  query(selector) {
    return this.container.querySelector(selector);
  }

  /**
   * Méthode utilitaire pour querySelectorAll
   */
  queryAll(selector) {
    return this.container.querySelectorAll(selector);
  }

  /**
   * Méthode utilitaire pour ajouter des écouteurs d'événements
   */
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Nettoyage avant destruction de la vue
   */
  async destroy() {
    // Suppression des écouteurs d'événements
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Appel de la méthode de nettoyage spécifique si elle existe
    if (typeof this.cleanup === "function") {
      await this.cleanup();
    }

    // Suppression du contenu
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message, options = {}) {
    const { timeout = 5000, type = "error", position = "prepend" } = options;

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const target = this.container || document.body;

    if (position === "prepend") {
      target.prepend(alert);
    } else {
      target.appendChild(alert);
    }

    setTimeout(() => {
      alert.remove();
    }, timeout);

    return alert;
  }

  /**
   * Affiche un loading state
   */
  showLoading() {
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = `
      <div class="spinner"></div>
      <p>Chargement...</p>
    `;
    this.container.appendChild(loader);
    return loader;
  }

  /**
   * Cache le loading state
   */
  hideLoading(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }
}
