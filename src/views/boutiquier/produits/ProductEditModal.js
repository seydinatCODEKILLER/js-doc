import { AbstractProductModal } from "./AbstractProductModal.js";

export class ProductEditModal extends AbstractProductModal {
  constructor(app, product) {
    super(app, {
      title: "Modifier le produit",
      product,
    });
    this.product = product;
  }

  async init() {
    await this.loadArticles();
    this.createForm();
    this.initForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
  }

  initForm() {
    if (!this.product) return;

    this.form.querySelector('[name="nom"]').value = this.product.nom || "";
    this.form.querySelector('[name="prix"]').value = this.product.prix || "";
    this.form.querySelector('[name="quantite"]').value =
      this.product.quantite || "";
    this.form.querySelector('[name="seuil_alerte"]').value =
      this.product.seuil_alerte || "";
    this.form.querySelector('[name="article_id"]').value =
      this.product.article_id || "";

    if (this.product.image) {
      const preview = this.form.querySelector("#product-image-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = this.product.image;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Enregistrer les modifications";
  }

  getLoadingText() {
    return "Mise à jour en cours...";
  }

  async processFormData(formData) {
    await this.controller.updateProduct(this.product.id, formData);
  }
}