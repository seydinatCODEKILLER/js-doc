// import { Modal } from "../../../components/modal/Modal.js";
// import { ArticleEditModal } from "./ArticleEditModal.js";

export class ArticleController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("articles");
    this.articles = [];
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

      const articles = await this.service.getArticles(boutiquier.id);
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

//   async createArticle(articleData) {
//     try {
//       const result = await this.service.createArticle(articleData);

//       this.cache.products = null;
//       this.app.services.notifications.show(
//         "article créé avec succès",
//         "success"
//       );

//       this.app.eventBus.publish("article:updated");
//       return result;
//     } catch (error) {
//       this.app.services.notifications.show(
//         error.message || "Erreur lors de la création",
//         "error"
//       );
//       throw error;
//     }
//   }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }

//   async handleArticleAction(action, id, actionType) {
//     switch (action) {
//       case "edit":
//         return this.#editArticle(id);
//       case "toggleStatus":
//         return actionType === "delete"
//           ? this.#deleteArticle(id)
//           : this.#restoreArticle(id);
//       default:
//         throw new Error(`Action ${action} non supportée`);
//     }
//   }

//   async #editArticle(id) {
//     try {
//       const product = this.cache.articles?.find((b) => b.id == id);

//       if (!product) {
//         throw new Error("article non trouvé");
//       }

//       const editModal = new ArticleEditModal(this.app, product);
//       editModal.open();
//     } catch (error) {
//       console.log(error);

//       this.app.services.notifications.show(
//         error.message || "Erreur lors de l'édition",
//         "error"
//       );
//     }
//   }

//   async updateArticle(id, data) {
//     try {
//       const result = await this.service.updateArticle(id, data);

//       this.cache.articles = null;
//       this.app.services.notifications.show(
//         "article mis à jour avec succès",
//         "success"
//       );

//       this.app.eventBus.publish("article:updated");
//       return result;
//     } catch (error) {
//       this.app.services.notifications.show(
//         error.message || "Erreur lors de la mise à jour",
//         "error"
//       );
//       throw error;
//     }
//   }

//   async #deleteArticle(id) {
//     const confirmed = await this.showDeleteConfirmation();
//     if (!confirmed) return;

//     await this.service.softDeleteArticle(id);
//     this.cache.articles = null;

//     this.app.services.notifications.show(
//       "produits désactivé avec succès",
//       "success"
//     );

//     this.app.eventBus.publish("articles:updated");
//   }
//   catch(error) {
//     this.app.services.notifications.show(
//       error.message || "Erreur lors de la désactivation",
//       "error"
//     );
//     throw error;
//   }

//   async showDeleteConfirmation() {
//     return new Promise((resolve) => {
//       Modal.confirm({
//         title: "Confirmer la désactivation",
//         content: "Êtes-vous sûr de vouloir désactiver ce article ?",
//         confirmText: "Désactiver",
//         cancelText: "Annuler",
//         onConfirm: () => resolve(true),
//         onCancel: () => resolve(false),
//       });
//     });
//   }

//   async #restoreArticle(id) {
//     try {
//       const confirmed = await this.showRestoreConfirmation();
//       if (!confirmed) return;

//       await this.service.restoreArticle(id);
//       this.cache.products = null;

//       this.app.services.notifications.show(
//         "article restauré avec succès",
//         "success"
//       );
//       this.app.eventBus.publish("articles:updated");
//     } catch (error) {
//       this.handleActionError(error, "restauration");
//     }
//   }

//   async showRestoreConfirmation() {
//     return new Promise((resolve) => {
//       Modal.confirm({
//         title: "Confirmer la restauration",
//         content: "Êtes-vous sûr de vouloir restaurer ce article ?",
//         confirmText: "Restaurer",
//         cancelText: "Annuler",
//         onConfirm: () => resolve(true),
//         onCancel: () => resolve(false),
//       });
//     });
//   }

//   handleActionError(error, actionName) {
//     this.app.services.notifications.show(
//       error.message || `Erreur lors de la ${actionName}`,
//       "error"
//     );
//     throw error;
//   }
}