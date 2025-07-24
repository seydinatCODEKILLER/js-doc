import { AbstractProductModal } from "./AbstractProductModal.js";

export class ProductFormModal extends AbstractProductModal {
  constructor(app) {
    super(app, {
      title: "Ajouter un produit",
      requirePassword: true,
    });
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createProduct(formData);
    this.app.eventBus.publish("boutiquiers:updated");
  }
}