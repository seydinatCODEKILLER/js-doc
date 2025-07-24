import { AbstractBoutiquierModal } from "./AbstractBoutiquierModal.js";

export class BoutiquierEditModal extends AbstractBoutiquierModal {
  constructor(app, boutiquier) {
    super(app, {
      title: "Modifier le boutiquier",
      requirePassword: false,
      boutiquier,
    });
    this.boutiquier = boutiquier;
  }

  initForm() {
    if (!this.boutiquier) return;

    this.form.querySelector('[name="nom"]').value = this.boutiquier.nom || "";
    this.form.querySelector('[name="prenom"]').value =
      this.boutiquier.prenom || "";
    this.form.querySelector('[name="email"]').value =
      this.boutiquier.email || "";
    this.form.querySelector('[name="password"]').value =
      this.boutiquier.password || "";

    if (
      this.boutiquier.telephone &&
      this.boutiquier.telephone.startsWith("+221")
    ) {
      const tel = this.boutiquier.telephone.substring(4);
      this.form.querySelector('[name="telephone"]').value = tel;
    }

    if (this.boutiquier.avatar) {
      const preview = this.form.querySelector("#avatar-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = this.boutiquier.avatar;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateBoutiquier(this.boutiquier.id, formData);
    this.app.eventBus.publish("boutiquiers:updated");
  }
}
