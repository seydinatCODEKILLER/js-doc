import { IMAGES } from "../utils/assets.js";

export class ErrorLayout {
  constructor(app) {
    this.app = app;
    this.container = null;
  }

  async setup() {
    this.container = document.createElement("div");
    this.container.className =
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200 p-4";

    this.container.innerHTML = `
      <div class="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 p-8 rounded-box bg-base-100 shadow-xl">
        <div class="w-full md:w-1/2 flex justify-center">
          <img src="${IMAGES.error_illustration}" alt="Error Illustration" class="w-full max-w-xs" />
        </div>
        <div class="w-full md:w-1/2 flex flex-col items-center text-center" id="error-content">
          <!-- Le contenu de la vue sera injecté ici -->
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  async renderView(view) {
    const contentArea = this.container.querySelector("#error-content");
    contentArea.innerHTML = "";

    if (typeof view.getContent === "function") {
      contentArea.appendChild(await view.getContent());
    } else if (view.container) {
      contentArea.appendChild(view.container);
    }
  }

  async beforeDestroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  destroy() {
    this.beforeDestroy();
  }
}
