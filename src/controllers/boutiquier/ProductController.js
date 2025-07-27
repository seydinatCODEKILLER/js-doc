import { Modal } from "../../components/modal/Modal.js";
import { ProductEditModal } from "../../views/boutiquier/produits/ProductEditModal.js";

export class ProductController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("products");
    this.articleService = app.getService("articles");
    this.boutiquier = null;
    this.products = [];
    this.articles = [];
    this.cache = {
      products: null,
      articles: null,
      lastUpdated: null,
    };
  }

  async loadProducts(forceRefresh = false) {
    if (!forceRefresh && this.cache.products && this.isCacheValid()) {
      this.products = this.cache.products;
      return this.products;
    }

    const userId = this.app.store.state.user.id;
    const boutiquier = await this.service.getActorByIdUser(
      userId,
      "boutiquier"
    );
    this.boutiquier = boutiquier;
    const products = await this.service.getProducts(this.boutiquier.id);

    this.products = products;
    this.cache.products = products;
    this.cache.lastUpdated = Date.now();
    return products;
  }

  async loadArticles(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.articles && this.isCacheValid()) {
        this.articles = this.cache.articles;
        return this.articles;
      }

      const articles = await this.articleService.getArticles(
        this.boutiquier.id
      );
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

  async createProduct(ProductData) {
    try {

      const result = await this.service.createProduct(
        ProductData,
        this.boutiquier.id
      );

      this.clearCache();
      this.app.services.notifications.show(
        "Boutiquier créé avec succès",
        "success"
      );

      this.app.eventBus.publish("product:updated");
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

  async updateProduct(id, data) {
    try {
      const result = await this.service.updateProduct(id, data);
      this.clearCache();
      this.app.services.notifications.show(
        "produit mis à jour avec succès",
        "success"
      );

      this.app.eventBus.publish("produit:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la mise à jour",
        "error"
      );
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await this.service.softDeleteProduit(id);
      this.clearCache();
      this.app.services.notifications.show(
        "produits désactivé avec succès",
        "success"
      );

      this.app.eventBus.publish("produits:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.products = null;
  }

  async restoreProduct(id) {
    try {
      await this.service.restoreProduit(id);
      this.clearCache();

      this.app.services.notifications.show(
        "produit restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("produits:updated");
    } catch (error) {
      this.handleActionError(error, "restauration");
    }
  }

  handleActionError(error, actionName) {
    this.app.services.notifications.show(
      error.message || `Erreur lors de la ${actionName}`,
      "error"
    );
    throw error;
  }
}
