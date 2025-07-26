import { IMAGES } from "../utils/assets.js";

export class AuthLayout {
  constructor(app) {
    this.app = app;
    this.container = null;
  }

  async setup() {
    this.container = document.createElement("div");
    this.container.className =
      "h-screen flex items-center justify-center w-full inset-0 bg-gradient-to-r from-indigo-50/50 to-white";

    this.container.innerHTML = `
      <div class="w-full md:w-[700px] lg:w-[1000px] flex items-center h-full md:h-[90vh] p-2 shadow-lg rounded-xl bg-white">
        <img src="${IMAGES.background}" alt="background" class="h-full object-cover w-1/2 rounded-xl hidden md:block" />
        <div class="relative w-full flex flex-col items-center justify-center h-full" id="auth-content"></div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  async renderView(view) {
    const contentArea = this.container.querySelector("#auth-content");
    contentArea.innerHTML = "";
    contentArea.appendChild(await view.getContent());
  }

  async beforeDestroy() {
    if (this.container) {
      document.body.removeChild(this.container);
    }
  }
}
