import { AbstractService } from "../../../app/core/AbstractService.js";
import { Article } from "../../../models/Article.js";

export class ArticleService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getArticles(boutiquierId) {
    try {
      console.log("Fetching articles for Boutiquier ID:", boutiquierId);
      const articles = await this.api.get(
        `/articles?id_boutiquier=${boutiquierId}`
      );

      return articles;
    } catch (error) {
      throw error;
    }
  }

    async nameExists(name) {
    const articles = await this.api.get("/articles");
    return articles.some((u) => u.titre?.toLowerCase() === name.toLowerCase());
  }

  async createArticle(data,id) {
    try {
      if (await this.nameExists(data.titre)) {
        throw new Error("Un article avec ce titre existe déjà");
      }
      const idArticle = String(await this.generateId("/articles"));
      const validData = {
        ...data,
        id: idArticle,
        id_boutiquier: id,
      }

      const article = new Article(validData);
      const articleData = article.toJSON();
      const articleResponse = await this.api.post("/articles", articleData);
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