export class ResponsiveHeader {
  element;
  config;

  constructor(config) {
    this.config = {
      currentYear: new Date().getFullYear(),
      onThemeChange: () => {},
      onMenuClick: () => {},
      ...config,
    };
    this.element = this.#createHeader();
  }

  render(container) {
    container.appendChild(this.element);
  }

  update(config) {
    this.config = { ...this.config, ...config };
    this.element.replaceWith(this.#createHeader());
  }

  cleanUp() {
    this.element.remove();
  }

  #createHeader() {
    const header = document.createElement("header");
    header.className =
      "bg-white dark:bg-gray-800 shadow-sm py-3 rounded px-4 sm:px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700";

    header.appendChild(this.#createLeftSection());
    header.appendChild(this.#createRightSection());

    return header;
  }

  getElement() {
    return this.element;
  }

  #createLeftSection() {
    const section = document.createElement("div");
    section.className = "flex items-center space-x-4";

    // Menu button
    const menuButton = document.createElement("button");
    menuButton.className =
      "lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors";
    menuButton.innerHTML = '<i class="ri-dashboard-line text-xl"></i>';
    menuButton.addEventListener("click", this.config.onMenuClick || (() => {}));

    // Breadcrumb container
    const breadcrumbContainer = document.createElement("div");
    breadcrumbContainer.className = "flex flex-col";
    breadcrumbContainer.appendChild(this.#createBreadcrumb());
    breadcrumbContainer.appendChild(this.#createWelcomeMessage());

    section.appendChild(menuButton);
    section.appendChild(breadcrumbContainer);

    return section;
  }

  #createBreadcrumb() {
    const breadcrumb = document.createElement("div");
    breadcrumb.className = "flex items-center text-sm text-gray-600";

    const pageIcon = this.#getPageIcon();
    breadcrumb.innerHTML = `
      <a class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
        <i class="ri-home-4-line mr-2"></i>Accueil
      </a>
      <span class="mx-2 text-gray-400 dark:text-gray-500">/</span>
      <span class="text-gray-800 dark:text-gray-200 font-medium flex items-center">
        ${pageIcon}
        ${this.config.currentPage}
      </span>
    `;

    return breadcrumb;
  }

  #getPageIcon() {
    if (this.config.currentPage.includes("cours")) {
      return '<i class="ri-calendar-todo-line mr-2"></i>';
    }
    if (this.config.currentPage.includes("classes")) {
      return '<i class="ri-team-line mr-2"></i>';
    }
    if (this.config.currentPage.includes("professeurs")) {
      return '<i class="ri-user-3-line mr-2"></i>';
    }
    return "";
  }

  #createWelcomeMessage() {
    const msg = document.createElement("h1");
    msg.className = "text-lg font-medium text-gray-700 hidden lg:flex";
    msg.textContent = `Espace administrateur, ${this.config.userName}👋`;
    return msg;
  }

  #createRightSection() {
    const section = document.createElement("div");
    section.className = "flex items-center space-x-4";

    section.appendChild(this.#createYearIndicator());
    section.appendChild(this.#createThemeToggle());

    return section;
  }

  #createYearIndicator() {
    const year = this.config.currentYear || new Date().getFullYear();
    const container = document.createElement("div");
    container.className =
      "flex items-center text-sm bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1";
    container.innerHTML = `
      <i class="ri-calendar-line text-gray-600 dark:text-gray-300 mr-2"></i>
      <span class="text-gray-800 dark:text-gray-200 font-medium">${year}-${
      year + 1
    }</span>
    `;
    return container;
  }

  #createThemeToggle() {
    const button = document.createElement("button");
    button.className =
      "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors text-gray-600 dark:text-gray-300";
    button.innerHTML = '<i class="ri-sun-line text-xl"></i>';
    button.addEventListener("click", this.config.onThemeChange || (() => {}));
    return button;
  }

  #toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  }
}
