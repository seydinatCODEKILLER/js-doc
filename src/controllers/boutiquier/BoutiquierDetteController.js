import { Modal } from "../../components/modal/Modal.js";

export class BoutiquierDetteController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("boutiquier_dette_services");
    this.dettes = [];
    this.cache = {
      dettes: null,
      lastUpdated: null,
    };
  }

  async loadDettes(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.dettes && this.isCacheValid()) {
        this.dettes = this.cache.dettes;
        return this.dettes;
      }

      const userId = this.app.store.state.user.id;
      const boutiquier = await this.service.getActorByIdUser(
        userId,
        "boutiquier"
      );

      if (!boutiquier) {
        throw new Error("Boutiquier non trouvé");
      }

      const dettes = await this.service.getDetteByBoutiquier(boutiquier.id);
      this.dettes = dettes;
      this.cache.dettes = dettes;
      this.cache.lastUpdated = Date.now();
      console.log(dettes);

      return dettes;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les dettes",
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

  async handleDetteAction(action, id) {
    try {
      switch (action) {
        case "accept":
          await this.#acceptDette(id);
          break;
        case "reject":
          await this.#rejectDette(id);
          break;
        default:
          console.warn("Action non gérée:", action);
      }
    } catch (error) {
      console.error("Erreur action dette:", error);
      this.app.services.notifications.show(
        error.message || "Erreur lors de l'action",
        "error"
      );
    }
  }

  async #rejectDette(id) {
    const confirmed = await this.showDeleteConfirmation("refuser", "Refuser");
    if (!confirmed) return;

    await this.service.rejectDette(id);
    this.cache.dettes = null;

    this.app.services.notifications.show(
      "dettes rejeter avec succès",
      "success"
    );

    this.app.eventBus.publish("dettes:updated");
  }
  catch(error) {
    this.app.services.notifications.show(
      error.message || "Erreur lors de la désactivation",
      "error"
    );
    throw error;
  }

  async showDeleteConfirmation(message, action) {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmer la votre action",
        content: `Êtes-vous sûr de vouloir ${message} ce dette ?`,
        confirmText: `${action}`,
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  async #acceptDette(id) {
    const confirmed = await this.showDeleteConfirmation("accepter", "Accepter");
    if (!confirmed) return;

    await this.service.acceptDette(id);
    this.cache.dettes = null;

    this.app.services.notifications.show(
      "dettes accepter avec succès",
      "success"
    );

    this.app.eventBus.publish("dettes:updated");
  }
  catch(error) {
    this.app.services.notifications.show(
      error.message || "Erreur lors de la désactivation",
      "error"
    );
    throw error;
  }
}
