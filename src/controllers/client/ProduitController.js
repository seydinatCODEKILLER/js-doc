import { Modal } from "../../components/modal/Modal.js";
import { ProductEditModal } from "../../views/boutiquier/produits/ProductEditModal.js";

export class ProduitController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("client_produits");
    this.products = [];
    this.cache = {
      products: null,
      lastUpdated: null,
    };
  }

    async loadProduits(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.products && this.isCacheValid()) {
        return this.cache.products;
      }

      const products = await this.service.getAllArticles();
      console.log(products);
      
      this.cache.products = products;
      this.cache.lastUpdated = Date.now();
      return products;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les produits",
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

  catch(error) {
    this.app.services.notifications.show(
      error.message || "Erreur lors de la désactivation",
      "error"
    );
    throw error;
  }

}