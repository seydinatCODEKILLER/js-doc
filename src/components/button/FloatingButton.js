export class FloatingActionButton {
  /**
   * Configuration par défaut
   */
  static defaultConfig = {
    color: "primary",
    position: "bottom-right",
    size: "md",
    shape: "circle",
    visible: true,
    disabled: false,
    pulse: false,
    tooltipPosition: "left",
  };

  /**
   * Positions prédéfinies
   */
  static positions = {
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "top-right": "top-8 right-8",
    "top-left": "top-8 left-8",
    center: "bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2",
  };

  /**
   * Tailles prédéfinies
   */
  static sizes = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  /**
   * Formes prédéfinies
   */
  static shapes = {
    circle: "btn-circle",
    square: "rounded-xl",
    pill: "rounded-full",
  };

  /**
   * Constructeur
   * @param {Object} config - Configuration du bouton
   */
  constructor(config) {
    this.config = {
      ...FloatingActionButton.defaultConfig,
      ...config,
    };

    this.element = null;
    this.tooltip = null;
    this.init();
  }

  /**
   * Initialisation du composant
   */
  init() {
    this.createButton();
    this.setupEvents();

    if (!this.config.visible) {
      this.hide();
    }
  }

  /**
   * Création de l'élément bouton
   */
  createButton() {
    this.element = document.createElement("button");
    this.element.id =
      this.config.id || `fab-${Math.random().toString(36).substr(2, 8)}`;
    this.element.className = this.buildClassNames();
    this.element.innerHTML = this.buildIcon();
    this.element.title = this.config.title || "";
    this.element.disabled = this.config.disabled;

    if (this.config.pulse) {
      this.addPulseEffect();
    }

    document.body.appendChild(this.element);
  }

  /**
   * Construction des classes CSS
   * @returns {string}
   */
  buildClassNames() {
    const position =
      FloatingActionButton.positions[this.config.position] ||
      FloatingActionButton.positions["bottom-right"];
    const size =
      FloatingActionButton.sizes[this.config.size] ||
      FloatingActionButton.sizes["md"];
    const shape =
      FloatingActionButton.shapes[this.config.shape] ||
      FloatingActionButton.shapes["circle"];

    return `
      fixed z-50
      btn btn-${this.config.color}
      ${shape} ${size}
      shadow-lg hover:shadow-xl
      transition-all duration-300
      ${position}
      ${this.config.className || ""}
    `
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Construction de l'icône/contenu
   * @returns {string}
   */
  buildIcon() {
    if (this.config.icon) {
      return `<i class="${this.config.icon}"></i>`;
    }
    return this.config.content || "";
  }

  /**
   * Ajout d'un effet de pulsation
   */
  addPulseEffect() {
    this.element.classList.add("animate-pulse");
  }

  /**
   * Configuration des événements
   */
  setupEvents() {
    if (this.config.onClick) {
      this.element.addEventListener("click", (e) => {
        if (!this.config.disabled) {
          this.config.onClick(e);
        }
      });
    }

    // Tooltip avancé
    if (this.config.tooltip) {
      this.setupTooltip();
    }
  }

  /**
   * Configuration du tooltip
   */
  setupTooltip() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = `tooltip tooltip-${this.config.tooltipPosition} absolute hidden`;
    this.tooltip.textContent = this.config.tooltip;

    this.element.appendChild(this.tooltip);

    this.element.addEventListener("mouseenter", () => {
      this.tooltip.classList.remove("hidden");
    });

    this.element.addEventListener("mouseleave", () => {
      this.tooltip.classList.add("hidden");
    });
  }

  /**
   * Affiche le bouton
   */
  show() {
    this.element.style.display = "flex";
    this.config.visible = true;
  }

  /**
   * Cache le bouton
   */
  hide() {
    this.element.style.display = "none";
    this.config.visible = false;
  }

  /**
   * Active/désactive le bouton
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
  }

  /**
   * Change la position du bouton
   * @param {string} position
   */
  setPosition(position) {
    this.config.position = position;
    const posClass =
      FloatingActionButton.positions[position] ||
      FloatingActionButton.positions["bottom-right"];

    // Supprime les anciennes classes de position
    Object.values(FloatingActionButton.positions).forEach((pos) => {
      this.element.classList.remove(...pos.split(" "));
    });

    // Ajoute les nouvelles classes
    posClass.split(" ").forEach((cls) => {
      this.element.classList.add(cls);
    });
  }

  /**
   * Met à jour l'icône
   * @param {string} icon
   */
  updateIcon(icon) {
    this.config.icon = icon;
    this.element.innerHTML = this.buildIcon();
  }

  /**
   * Met à jour le contenu
   * @param {string|HTMLElement} content
   */
  updateContent(content) {
    this.config.content = content;
    this.element.innerHTML = this.buildIcon();
  }

  /**
   * Détruit le composant
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
