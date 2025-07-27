import { AbstractService } from "../../../app/core/AbstractService.js";
import { Product } from "../../../models/Product.js";

export class ProductService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getProducts(boutiquierId) {
    try {
      const produits = await this.api.get(
        `/produits?id_boutiquier=${boutiquierId}`
      );
      const articles = await this.api.get(
        `/articles?id_boutiquier=${boutiquierId}`
      );
      const articleMap = new Map();
      articles.forEach((article) => {
        articleMap.set(article.id, article);
      });

      const produitsEnriched = produits.map((produit) => {
        const articleAssocie = produit.article_id
          ? articleMap.get(produit.article_id)
          : null;
        return {
          ...produit,
          categorie: articleAssocie?.titre || null,
        };
      });

      return produitsEnriched;
    } catch (error) {
      throw error;
    }
  }

  async nameExists(name) {
    const produits = await this.api.get("/produits");
    return produits.some((u) => u.nom?.toLowerCase() === name.toLowerCase());
  }

  async createProduct(data,id) {
    try {
      if (await this.nameExists(data.nom)) {
        throw new Error("ce produit avec ce titre existe déjà");
      }
      const idProduit = String(await this.generateId("/produits"));
      const product = new Product({ ...data, id: idProduit, id_boutiquier: id });
      const productData = product.toJSON();

      const productResponse = await this.api.post("/produits", {
        id: idProduit,
        ...productData,
      });

      return productResponse;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, data) {
    try {
      return await this.api.patch(`/produits/${id}`, data);
    } catch (error) {
      console.error("Erreur updateProduct:", error);
      throw error;
    }
  }

  async softDeleteProduit(id) {
    try {
      const response = await this.api.patch(`/produits/${id}`, {
        deleted: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async restoreProduit(id) {
    try {
      return await this.api.patch(`/produits/${id}`, {
        deleted: false,
      });
    } catch (error) {
      throw error;
    }
  }
}