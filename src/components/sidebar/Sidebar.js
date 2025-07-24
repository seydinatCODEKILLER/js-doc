export default class Sidebar {
  constructor(options) {
    this.config = {
      logo: {
        icon: "ri-funds-fill",
        text: "E-Boutique",
      },
      user: {
        avatar: "",
        role: "",
        name: "",
      },
      links: [],
      onLogout: () => {},
      onNavigate: () => {},
      ...options,
    };
    this.element = null;
  }

  render(container) {
    // Création du markup
    const markup = this.#createSidebarMarkup();
    const temp = document.createElement("div");
    temp.innerHTML = markup;

    this.element = temp.firstElementChild;

    this.#setupEventListeners();
    container.appendChild(this.element);
  }

  #createSidebarMarkup() {
    return `
      <div id="sidebar" class="flex flex-col justify-between p-3 fixed left-0 shadow-md h-full bg-white text-gray-900 w-64 lg:w-52 md:flex transform transition-transform duration-300 ease-in-out translate-x-0 z-50">
        <div class="flex flex-col gap-6">
          ${this.#createHeaderMarkup()}
          ${this.#createNavigationMarkup()}
        </div>
        ${this.#createFooterMarkup()}
      </div>
    `;
  }

  #createHeaderMarkup() {
    return `
      <div class="flex justify-between">
        <div class="flex items-center gap-2 text-md">
          <i class="${this.config.logo.icon} text-xl"></i>
          <span class="font-medium">${this.config.logo.text}</span>
        </div>
        <div class="lg:hidden" id="sidebar-close">
          <i class="ri-layout-right-line text-lg font-semibold"></i>
        </div>
      </div>
    `;
  }

  #createNavigationMarkup() {
    const links = this.config.links
      .map(
        (link) => `
      <li class="py-2 px-4 ${
        link.active ? "bg-purple-500 text-white shadow-lg rounded-3xl" : ""
      }">
        <a href="${
          link.path || "#"
        }" class="font-medium gap-3 flex items-center text-sm">
          <i class="${link.icon} text-lg"></i>
          <span>${link.text}</span>
        </a>
      </li>
    `
      )
      .join("");

    return `
      <nav class="flex flex-col gap-6">
        <ul class="flex flex-col gap-1">
          ${links}
        </ul>
      </nav>
    `;
  }

  #createFooterMarkup() {
    return `
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <img src="${this.config.user.avatar}" alt="Avatar" class="w-9 h-9 rounded-3xl object-cover">
          <div class="flex flex-col">
            <span class="text-xs text-purple-500 font-medium">${this.config.user.role}</span>
            <p class="font-medium text-gray-800 text-xs">${this.config.user.name}</p>
          </div>
        </div>
        <div class="dropdown dropdown-top w-9 h-9 flex justify-center items-center hover:bg-gray-50 rounded border border-gray-300">
          <i class="ri-expand-up-down-line" tabindex="0" role="button"></i>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-44 p-2 shadow-sm">
            <li>
              <a href="#/profile" class="text-sm font-semibold border-b border-gray-100">
                <i class="ri-settings-2-line font-medium"></i>
                <span>Mon compte</span>
              </a>
            </li>
            <li>
              <a id="logoutBtn" class="text-sm font-semibold">
                <i class="ri-logout-box-r-line font-medium"></i>
                <span>Déconnexion</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `;
  }

  #setupEventListeners() {
    // Bouton de fermeture
    this.element
      .querySelector("#sidebar-close")
      ?.addEventListener("click", () => this.toggle());

    // Liens de navigation
    this.element.querySelectorAll("nav a").forEach((a, index) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const path = this.config.links[index].path;
        this.config.onNavigate(path);
        this.setActiveLink(path);
      });
    });

    // Bouton de déconnexion
    this.element.querySelector("#logoutBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.config.onLogout();
    });
  }

  toggle() {
    this.element.classList.toggle("-translate-x-full");
  }

  setActiveLink(path) {
    this.element.querySelectorAll("li").forEach((li) => {
      li.classList.remove(
        "bg-purple-500",
        "text-white",
        "rounded-3xl",
        "shadow-lg"
      );
    });

    const activeLink = this.element.querySelector(`a[href="${path}"]`);
    activeLink?.parentElement.classList.add(
      "bg-purple-500",
      "text-white",
      "rounded-3xl",
      "shadow-lg"
    );
  }
}
