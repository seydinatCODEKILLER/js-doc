import { IMAGES } from "../utils/assets.js";

export class ErrorLayout {
  constructor(app) {
    this.app = app;
    this.container = null;
  }

  async setup() {
    this.container = document.createElement("div");
    this.container.className =
      "min-h-screen flex items-center justify-center";

    this.container.innerHTML = `
      <div class="w-full flex flex-col items-center justify-center gap-2">
        <div class="">
          <img src="${IMAGES.error_illustration}" alt="Error Illustration" class="object-cover h-full md:h-96 lg:h-[500px]" />
        </div>
        <div class="w-full flex flex-col items-center text-center gap-2" id="error-content">
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
