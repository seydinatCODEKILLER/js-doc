export class ClientController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("clients");
    this.cache = {
      articles: null,
      lastUpdated: null,
    };
  }

  async loadArticles(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.articles && this.isCacheValid()) {
        return this.cache.articles;
      }

      const articles = await this.service.getAllArticles();
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

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }

  filterArticles(status = "all") {
    if (!this.cache.articles) return [];

    switch (status) {
      case "active":
        return this.cache.articles.filter((b) => !b.deleted);
      case "deleted":
        return this.cache.articles.filter((b) => b.deleted);
      default:
        return this.cache.articles;
    }
  }
}
