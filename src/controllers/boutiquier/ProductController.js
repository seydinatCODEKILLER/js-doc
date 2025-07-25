import { Modal } from "../../components/modal/Modal.js";
import { ProductEditModal } from "../../views/boutiquier/produits/ProductEditModal.js";

export class ProductController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("products");
    this.articleService = app.getService("articles");
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
    const products = await this.service.getProducts(boutiquier.id);

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

      const userId = this.app.store.state.user.id;
      const boutiquier = await this.service.getActorByIdUser(
        userId,
        "boutiquier"
      );

      if (!boutiquier) {
        throw new Error("Boutiquier non trouvé");
      }

      const articles = await this.articleService.getArticles(boutiquier.id);
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
      console.log(ProductData);

      const result = await this.service.createProduct(ProductData);

      this.cache.products = null;
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

  async handleProductAction(action, id, actionType) {
    switch (action) {
      case "edit":
        return this.#editProduct(id);
      case "toggleStatus":
        return actionType === "delete"
          ? this.#deleteProduct(id)
          : this.#restoreProduct(id);
      default:
        throw new Error(`Action ${action} non supportée`);
    }
  }

  async #editProduct(id) {
    try {
      const product = this.cache.products?.find((b) => b.id == id);

      if (!product) {
        throw new Error("produit non trouvé");
      }

      const editModal = new ProductEditModal(this.app, product);
      await editModal.open();
    } catch (error) {
      console.log(error);

      this.app.services.notifications.show(
        error.message || "Erreur lors de l'édition",
        "error"
      );
    }
  }

  async updateProduct(id, data) {
    try {
      const result = await this.service.updateProduct(id, data);

      this.cache.products = null;
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

  async #deleteProduct(id) {
    const confirmed = await this.showDeleteConfirmation();
    if (!confirmed) return;

    await this.service.softDeleteProduit(id);
    this.cache.products = null;

    this.app.services.notifications.show(
      "produits désactivé avec succès",
      "success"
    );

    this.app.eventBus.publish("produits:updated");
  }
  catch(error) {
    this.app.services.notifications.show(
      error.message || "Erreur lors de la désactivation",
      "error"
    );
    throw error;
  }

  async showDeleteConfirmation() {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmer la désactivation",
        content: "Êtes-vous sûr de vouloir désactiver ce produits ?",
        confirmText: "Désactiver",
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  async #restoreProduct(id) {
    try {
      const confirmed = await this.showRestoreConfirmation();
      if (!confirmed) return;

      await this.service.restoreProduit(id);
      this.cache.products = null;

      this.app.services.notifications.show(
        "produit restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("produits:updated");
    } catch (error) {
      this.handleActionError(error, "restauration");
    }
  }

  async showRestoreConfirmation() {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmer la restauration",
        content: "Êtes-vous sûr de vouloir restaurer ce produit ?",
        confirmText: "Restaurer",
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  handleActionError(error, actionName) {
    this.app.services.notifications.show(
      error.message || `Erreur lors de la ${actionName}`,
      "error"
    );
    throw error;
  }
}