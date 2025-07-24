import { AbstractBoutiquierModal } from "./AbstractBoutiquierModal.js";

export class BoutiquierFormModal extends AbstractBoutiquierModal {
  constructor(app) {
    super(app, {
      title: "Ajouter un boutiquier",
      requirePassword: true,
    });
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createBoutiquier(formData);
    this.app.eventBus.publish("boutiquiers:updated");
  }
}
