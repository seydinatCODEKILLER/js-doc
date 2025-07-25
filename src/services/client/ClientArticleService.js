import { AbstractService } from "../../app/core/AbstractService.js";
import { Article } from "../../models/Article.js";


export class ClientArticleService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getAllArticles() {
    const article = await this.api.get("/produits");
    return article;
  }

  async getArticle(id) {
    try {
      return await this.api.get(`/produits/${id}`);
    } catch (error) {
      throw error;
    }
  }

}
