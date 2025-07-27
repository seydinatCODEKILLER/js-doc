import { ResponsiveHeader } from "../components/header/Header.js";
import Sidebar from "../components/sidebar/Sidebar.js";

export class BoutiquierLayout {
  constructor(app) {
    this.app = app;
    this.container = document.createElement("div");
    this.container.className =
      "flex min-h-screen inset-0 bg-gradient-to-r from-indigo-50/50 to-white";
    this.sidebarInstance = null;
  }

  async setup() {
    this.container.innerHTML = `
      <div id="sidebar-container" class="hidden md:block"></div>
      <div class="flex flex-col lg:ml-56 w-full">
        <div id="header-container" class=""w-full></div>
        <main id="main-content" class="overflow-auto"></main>
      </div>
    `;
    const { avatar, nom, prenom } = this.app.store.state.user;

    const header = new ResponsiveHeader({
      currentPage: "Boutiquier",
      subtitle: "Espace boutiquier",
      userName: `${prenom} ${nom}` || "Boutiquier",
      onMenuClick: () => this.toggleSidebar(),
      onThemeChange: () => this.toggleTheme(),
    });

    header.render(this.container.querySelector("#header-container"));

    this.sidebarInstance = new Sidebar({
      logo: {
        icon: "ri-nft-fill text-purple-500 text-xl",
        text: "E-Boutique",
      },
      user: {
        avatar: avatar || "",
        role: "Boutiquier",
        name: `${prenom} ${nom} ` || "Boutiquier",
      },
      links: [
        {
          text: "Mes Produits",
          icon: "ri-dashboard-line",
          path: "/boutiquier/products",
          active: true,
        },
        {
          text: "Mes Articles",
          icon: "ri-article-line",
          path: "/boutiquier/articles",
        },
        {
          text: "Demandes",
          icon: "ri-shopping-bag-3-line",
          path: "/boutiquier/dettes",
        },
        {
          text: "Mes Clients",
          icon: "ri-cloud-line",
          path: "/boutiquier/clients",
        },
      ],
      onNavigate: (path) => this.app.router.navigateTo(path),
      onLogout: () => this.app.getController("Auth").logout(),
    });

    this.sidebarInstance.render(
      this.container.querySelector("#sidebar-container")
    );

    document.body.appendChild(this.container);
  }

  async renderView(view) {
    const main = this.container.querySelector("#main-content");
    main.innerHTML = "";
    main.appendChild(await view.getContent());
  }

  toggleSidebar() {
    if (this.sidebarInstance) {
      console.log(this.sidebarInstance);
      this.sidebarInstance.toggle();
    }
  }

  toggleTheme() {
    console.log("theme changer");
  }

  async beforeDestroy() {
    if (this.container) {
      document.body.removeChild(this.container);
    }
  }
}