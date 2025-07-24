import { AbstractArticleModal } from "./AbstractArticleModal.js";

export class ArticleFormModal extends AbstractArticleModal {
  constructor(app) {
    super(app, {
      title: "Ajouter un article",
      requirePassword: true,
    });
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createArticle(formData);
    this.app.eventBus.publish("articles:updated");
  }
}