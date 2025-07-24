import { ResponsiveHeader } from "../components/header/Header.js";
import Sidebar from "../components/sidebar/Sidebar.js";

export class ClientLayout {
  constructor(app) {
    this.app = app;
    this.container = document.createElement("div");
    this.container.className =
      "flex min-h-screen inset-0 bg-gradient-to-r from-indigo-50/50 to-white";
    this.sidebarInstance = null;
  }

  async setup() {
    this.container.innerHTML = `
      <div id="sidebar-container" class="hidden md:flex"></div>
      <div class="flex flex-col lg:ml-56 w-full">
        <div id="header-container" class="w-full"></div>
        <main id="main-content" class="overflow-auto"></main>
      </div>
    `;

    const header = new ResponsiveHeader({
      currentPage: "Client",
      userName: this.app.store.state.user?.prenom || "Client",
      onMenuClick: () => this.toggleSidebar(),
      onThemeChange: () => this.toggleTheme(),
    });

    header.render(this.container.querySelector("#header-container"));
    const { avatar, nom, prenom } = this.app.store.state.user;

    this.sidebarInstance = new Sidebar({
      logo: {
        icon: "ri-nft-fill text-purple-500 text-xl",
        text: "E-Boutique",
      },
      user: {
        avatar: avatar || "",
        role: "Client",
        name: `${prenom} ${nom} ` || "Client",
      },
      links: [
        {
          text: "Boutique",
          icon: "ri-dashboard-line",
          path: "/client/boutique",
          active: true,
        },
        {
          text: "Dettes",
          icon: "ri-user-3-line",
          path: "/client/dettes",
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
