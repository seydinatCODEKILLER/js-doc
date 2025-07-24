import { AbstractClientModal } from "./AbstractClientModal.js";

export class ClientFormModal extends AbstractClientModal {
  constructor(app) {
    super(app, {
      title: "Ajouter un nouveau client",
      requirePassword: true,
    });
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createClient(formData);
    this.app.eventBus.publish("client:updated");
  }
}
