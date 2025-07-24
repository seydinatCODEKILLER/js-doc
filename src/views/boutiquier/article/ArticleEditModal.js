import { AbstractArticleModal } from "./AbstractArticleModal.js";

export class ArticleEditModal extends AbstractArticleModal {
  constructor(app, article) {
    super(app, {
      title: "Modifier l'article",
      article,
    });
    this.article = article;
  }

  initForm() {
    if (!this.article) return;

    this.form.querySelector('[name="titre"]').value = this.article.titre || "";
    this.form.querySelector('[name="contenu"]').value =
      this.article.contenu || "";
  }

  getSubmitButtonText() {
    return "Enregistrer les modifications";
  }

  getLoadingText() {
    return "Mise à jour en cours...";
  }

  async processFormData(formData) {
    await this.controller.updateArticle(this.article.id, formData);
  }
}