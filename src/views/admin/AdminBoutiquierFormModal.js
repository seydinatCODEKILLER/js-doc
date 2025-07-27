import { AbstractBoutiquierModal } from "./AbstractBoutiquierModal.js";

export class BoutiquierFormModal extends AbstractBoutiquierModal {
  constructor(app, existingBoutiquiers = []) {
    super(app, {
      title: "Ajouter un boutiquier",
      requirePassword: true,
    });
    this.existingBoutiquiers = existingBoutiquiers;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createBoutiquier(formData);
    this.app.eventBus.publish("boutiquiers:updated");
  }
}
