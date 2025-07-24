import { AbstractService } from "../../../app/core/AbstractService.js";
import { Article } from "../../../models/Article.js";

export class ArticleService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getArticles(boutiquierId) {
    try {
      const articles = await this.api.get(
        `/articles?id_boutiquier=${boutiquierId}`
      );

      return articles;
    } catch (error) {
      throw error;
    }
  }

  async createArticle(data) {
    try {
      const idArticle = await this.generateId("/articles");

      const article = new Article({ ...data, id: idArticle });
      const articleData = article.toJSON();

      const articleResponse = await this.api.post("/articles", {
        id: String(idArticle),
        ...articleData,
      });

      return articleResponse;
    } catch (error) {
      throw error;
    }
  }

  async updateArticle(id, data) {
    try {
      return await this.api.patch(`/articles/${id}`, data);
    } catch (error) {
      console.error("Erreur updateProduct:", error);
      throw error;
    }
  }

  async softDeleteArticle(id) {
    try {
      const response = await this.api.patch(`/articles/${id}`, {
        deleted: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async restoreArticle(id) {
    try {
      return await this.api.patch(`/articles/${id}`, {
        deleted: false,
      });
    } catch (error) {
      throw error;
    }
  }
}