

export class ArticleController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("articles");
    this.articles = [];
    this.boutiquier = null;
    this.cache = {
      articles: null,
      lastUpdated: null,
    };
  }

  async loadArticles(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.articles && this.isCacheValid()) {
        this.articles = this.cache.articles;
        return this.articles;
      }

      const userId = this.app.store.state.user.id;
      const boutiquier = await this.service.getActorByIdUser(
        userId,
        "boutiquier"
      );

      if (!boutiquier) {
        throw new Error("Boutiquier non trouvé");
      }

      this.boutiquier = boutiquier;

      const articles = await this.service.getArticles(this.boutiquier.id);
      this.articles = articles;
      this.cache.articles = articles;
      this.cache.lastUpdated = Date.now();

      return articles;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les articles",
        "error"
      );
      throw error;
    }
  }

  async createArticle(articleData) {
    try {
      const result = await this.service.createArticle(
        articleData,
        this.boutiquier.id
      );

      this.clearCache();
      this.app.services.notifications.show(
        "article créé avec succès",
        "success"
      );

      this.app.eventBus.publish("article:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la création",
        "error"
      );
      throw error;
    }
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }


  async updateArticle(id, data) {
    try {
      const result = await this.service.updateArticle(id, data);

      this.clearCache();
      this.app.services.notifications.show(
        "article mis à jour avec succès",
        "success"
      );

      this.app.eventBus.publish("article:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la mise à jour",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.articles = null;
  }

  async deleteArticle(id) {
    try {

      await this.service.softDeleteArticle(id);
      this.clearCache();

      this.app.services.notifications.show(
        "produits désactivé avec succès",
        "success"
      );

      this.app.eventBus.publish("articles:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  async restoreArticle(id) {
    try {

      await this.service.restoreArticle(id);
      this.clearCache();
      this.app.services.notifications.show(
        "article restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("articles:updated");
    } catch (error) {
      this.handleActionError(error, "restauration");
    }
  }
}
