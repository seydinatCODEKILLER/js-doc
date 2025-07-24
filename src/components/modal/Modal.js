export class Modal {
  static modalStack = [];
  static zIndexBase = 1000; // Z-index de base

  constructor(config = {}) {
    this.config = {
      id: `modal-${Math.random().toString(36).substring(2, 9)}`,
      title: "Modal",
      content: "",
      showCloseButton: true,
      size: "md", // sm | md | lg | xl | full
      scrollable: false,
      showFooter: true,
      footerButtons: [],
      closeOnBackdropClick: true,
      onOpen: null,
      onClose: null,
      autoFocusSelector: null,
      animationDuration: 300,
      ...config,
    };

    this.isOpen = false;
    this.zIndex = Modal.zIndexBase + Modal.modalStack.length * 10;
    this.lastFocusedElement = null;
    this.init();
  }

  init() {
    this.createModal();
    this.createModalBox();
    this.createHeader();
    this.createContent();
    this.createFooter();
    this.setupEvents();
  }

  createModal() {
    this.modal = document.createElement("div");
    this.modal.id = this.config.id;
    this.modal.className =
      "modal fixed inset-0 flex items-center justify-center p-4 invisible opacity-0 transition-all duration-300 ease-in-out";
    this.modal.style.zIndex = this.zIndex;

    // Backdrop - doit être en dessous mais ne doit pas capturer les clics sur le modal-box
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop fixed inset-0 bg-black/50";
    this.backdrop.style.zIndex = "0";

    // Conteneur principal pour le modal-box
    this.modalContainer = document.createElement("div");
    this.modalContainer.className =
      "relative z-10 w-full h-full flex items-center justify-center";
    this.modalContainer.style.pointerEvents = "none"; // Désactive les clics sur le conteneur

    this.modal.appendChild(this.backdrop);
    this.modal.appendChild(this.modalContainer);
  }

  createModalBox() {
    this.modalBox = document.createElement("div");
    this.modalBox.className = `modal-box relative w-full max-w-${this.config.size} bg-base-100 rounded-lg shadow-xl transform transition-all duration-${this.config.animationDuration} ease-in-out scale-95 opacity-0`;
    this.modalBox.style.pointerEvents = "auto"; // Réactive les clics sur le contenu

    if (this.config.scrollable) {
      this.modalBox.classList.add("max-h-[90vh]", "overflow-y-auto");
    }

    this.modalContainer.appendChild(this.modalBox);
  }

  createHeader() {
    const header = document.createElement("div");
    header.className =
      "modal-header flex items-center justify-between mb-4 sticky top-0 bg-base-100 pt-2 z-10";

    const title = document.createElement("h3");
    title.className = "font-bold text-xl";
    title.id = `${this.config.id}-title`;
    title.textContent = this.config.title;

    header.appendChild(title);

    if (this.config.showCloseButton) {
      header.appendChild(this.createCloseButton());
    }

    this.modalBox.appendChild(header);
  }

  createCloseButton() {
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close-btn btn btn-sm btn-circle btn-ghost";
    closeBtn.innerHTML = "✕";
    closeBtn.setAttribute("aria-label", "Fermer la fenêtre modale");
    closeBtn.onclick = () => this.close();
    return closeBtn;
  }

  createContent() {
    this.content = document.createElement("div");
    this.content.className = "modal-content py-2";
    this.content.id = `${this.config.id}-desc`;

    if (typeof this.config.content === "string") {
      this.content.innerHTML = this.config.content;
    } else if (this.config.content instanceof HTMLElement) {
      this.content.appendChild(this.config.content);
    }

    this.modalBox.appendChild(this.content);
  }

  createFooter() {
    if (!this.config.showFooter && this.config.footerButtons.length === 0)
      return;

    const footer = document.createElement("div");
    footer.className =
      "modal-footer modal-action sticky bottom-0 bg-base-100 pb-2";

    if (this.config.footerButtons.length > 0) {
      this.config.footerButtons.forEach((btnConfig) => {
        footer.appendChild(this.createFooterButton(btnConfig));
      });
    } else if (this.config.showFooter) {
      footer.appendChild(this.createDefaultCloseButton());
    }

    this.modalBox.appendChild(footer);
  }

  createFooterButton(btnConfig) {
    const btn = document.createElement("button");
    btn.className = `modal-btn btn ${btnConfig.className || ""}`;
    btn.dataset.action = btnConfig.action || "default";
    btn.type = "button";

    btn.innerHTML = `
    <span class="btn-text">${btnConfig.text}</span>
    <span class="ml-2 spinner loading loading-spinner hidden"></span>
  `;

    if (btnConfig.onClick) {
      btn.onclick = async (e) => {
        const result = await btnConfig.onClick(e);
        if (btnConfig.closeOnClick !== false && result !== false) {
          this.close();
        }
      };
    } else {
      btn.onclick = () => this.close();
    }

    return btn;
  }

  setButtonLoading(
    action = "default",
    isLoading = true,
    textLoading = "Chargement...",
    textDefault = null
  ) {
    const btn = this.modal.querySelector(`button[data-action="${action}"]`);
    if (!btn) return;

    const spinner = btn.querySelector(".spinner");
    const textSpan = btn.querySelector(".btn-text");

    if (spinner) {
      spinner.classList.toggle("hidden", !isLoading);
    }

    if (textSpan) {
      if (isLoading) {
        textSpan.textContent = textLoading;
      } else {
        textSpan.textContent =
          textDefault || btn.dataset.originalText || "Valider";
      }
    }

    btn.disabled = isLoading;
  }

  createDefaultCloseButton() {
    return this.createFooterButton({
      text: "Fermer",
      className: "",
      action: "close",
      onClick: () => this.close(),
      closeOnClick: true,
    });
  }

  setupEvents() {
    // Empêche la propagation des clics du modal-box vers le backdrop
    this.modalBox.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    if (this.config.closeOnBackdropClick) {
      this.backdrop.addEventListener("click", () => {
        if (this.isTopModal()) {
          this.close();
        }
      });
    }
  }

  isTopModal() {
    return (
      Modal.modalStack.length > 0 &&
      Modal.modalStack[Modal.modalStack.length - 1] === this
    );
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;

    // Debug
    console.log("Modal.open() called");
    console.log("Modal element:", this.modal);
    console.log("ModalBox element:", this.modalBox);

    // Force l'affichage avant les animations
    this.modal.style.display = "flex";
    this.modal.style.visibility = "visible";
    this.modal.style.opacity = "1";

    this.modalBox.style.transform = "scale(1)";
    this.modalBox.style.opacity = "1";

    // Reste du code original...
    this.lastFocusedElement = document.activeElement;
    Modal.modalStack.push(this);
    this.updateModalStack();
    document.body.appendChild(this.modal);
    document.body.style.overflow = "hidden";

    // Focus management
    this.focusFirstElement();

    if (typeof this.config.onOpen === "function") {
      this.config.onOpen(this);
    }
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    // Trigger animation
    this.modal.classList.add("opacity-0");
    this.modalBox.classList.add("scale-95", "opacity-0");

    // Wait for animation to complete before removing
    setTimeout(() => {
      this.removeFromStack();
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      // Restore focus
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }

      // Call onClose callback
      if (typeof this.config.onClose === "function") {
        this.config.onClose(this);
      }
    }, this.config.animationDuration);
  }

  updateModalStack() {
    Modal.modalStack.forEach((modal, index) => {
      const currentZIndex = Modal.zIndexBase + index * 10;
      modal.modal.style.zIndex = currentZIndex;
      modal.modalBox.style.zIndex = currentZIndex + 1;

      if (index === Modal.modalStack.length - 1) {
        modal.modal.inert = false;
        modal.modal.removeAttribute("aria-hidden");
      } else {
        modal.modal.inert = true;
        modal.modal.setAttribute("aria-hidden", "true");
      }
    });
  }

  removeFromStack() {
    const index = Modal.modalStack.indexOf(this);
    if (index > -1) {
      Modal.modalStack.splice(index, 1);
      this.updateModalStack();
    }
    if (this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }

  focusFirstElement() {
    let elementToFocus = null;

    // Try autoFocusSelector first
    if (this.config.autoFocusSelector) {
      elementToFocus = this.modal.querySelector(this.config.autoFocusSelector);
    }

    // Fallback to first focusable element
    if (!elementToFocus) {
      const focusableSelectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        'input[type="text"]:not([disabled])',
        'input[type="radio"]:not([disabled])',
        'input[type="checkbox"]:not([disabled])',
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ];
      const focusableElements = this.modal.querySelectorAll(
        focusableSelectors.join(",")
      );
      if (focusableElements.length > 0) {
        elementToFocus = focusableElements[0];
      }
    }

    // Final fallback to modal itself
    elementToFocus = elementToFocus || this.modal;
    elementToFocus.focus();
  }

  trapFocus(e) {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ];
    const focusableElements = Array.from(
      this.modal
        .querySelectorAll(focusableSelectors.join(","))
        .filter(
          (el) => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.disabled
        )
    );

    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  updateContent(newContent) {
    this.content.innerHTML = "";

    if (typeof newContent === "string") {
      this.content.innerHTML = newContent;
    } else if (newContent instanceof HTMLElement) {
      this.content.appendChild(newContent);
    }
  }

  getScrollbarWidth() {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  destroy() {
    this.close();
    this.removeFromStack();

    // Clean up event listeners
    if (this.backdrop) {
      this.backdrop.replaceWith(this.backdrop.cloneNode(true));
    }

    const closeBtn = this.modal?.querySelector(".modal-close-btn");
    if (closeBtn) {
      closeBtn.onclick = null;
    }

    // Remove modal from DOM if it's still there
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }

  static alert(config) {
    const defaultConfig = {
      title: config.title || "Alert",
      content: config.content || "This is an alert message.",
      showFooter: true,
      footerButtons: [
        {
          text: config.buttonText || "OK",
          className: "btn-primary",
          onClick: config.onConfirm,
          closeOnClick: true,
        },
      ],
      closeOnBackdropClick: false,
    };

    const modal = new Modal({ ...defaultConfig, ...config });
    modal.open();
    return modal;
  }

  static confirm(config) {
    const defaultConfig = {
      title: config.title || "Confirmation",
      content: config.content || "Are you sure you want to proceed?",
      showFooter: true,
      footerButtons: [
        {
          text: config.cancelText || "Cancel",
          className: "btn-ghost",
          onClick: config.onCancel,
          closeOnClick: true,
        },
        {
          text: config.confirmText || "Confirm",
          className: "btn-primary",
          onClick: config.onConfirm,
          closeOnClick: true,
        },
      ],
      closeOnBackdropClick: true,
    };

    const modal = new Modal({ ...defaultConfig, ...config });
    modal.open();
    return modal;
  }

  get element() {
    return this.modal;
  }
}
