import { Modal } from "../components/modal/Modal.js";
// import { BoutiquierEditModal } from "./AdminBoutiquierEditModal.js";

export class AdminController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("admins");
    this.boutiquiers = [];
    this.cache = {
      boutiquiers: null,
      lastUpdated: null,
    };
  }

  async getDashboardStats() {
    try {
      const rawStats = await this.service.getAllBoutiquiers();
      return this.#formatStats(rawStats);
    } catch (error) {
      console.error("AdminController > getDashboardStats failed:", error);
      throw error;
    }
  }

  async loadBoutiquiers(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.boutiquiers && this.isCacheValid()) {
        return this.cache.boutiquiers;
      }

      const boutiquiers = await this.service.getAllBoutiquiers();
      this.cache.boutiquiers = boutiquiers;
      this.cache.lastUpdated = Date.now();
      return boutiquiers;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les boutiquiers",
        "error"
      );
      throw error;
    }
  }

  async createBoutiquier(formData) {
    try {
      const result = await this.service.createBoutiquier(formData);

      this.cache.boutiquiers = null;
      this.app.services.notifications.show(
        "Boutiquier créé avec succès",
        "success"
      );

      this.app.eventBus.publish("boutiquiers:updated");
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

  async handleBoutiquierAction(action, id, actionType) {
    switch (action) {
      case "edit":
        return this.#editBoutiquier(id);
      case "toggleStatus":
        return actionType === "delete"
          ? this.#deleteBoutiquier(id)
          : this.#restoreBoutiquier(id);
      default:
        throw new Error(`Action ${action} non supportée`);
    }
  }

  async #editBoutiquier(id) {
    try {
      const boutiquier = this.cache.boutiquiers?.find((b) => b.id == id);
      console.log(boutiquier);

      if (!boutiquier) {
        throw new Error("Boutiquier non trouvé");
      }

      const editModal = new BoutiquierEditModal(this.app, boutiquier);
      editModal.open();
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de l'édition",
        "error"
      );
    }
  }

  async updateBoutiquier(id, data) {
    try {
      console.log(data);

      const result = await this.service.updateBoutiquier(id, data);

      this.cache.boutiquiers = null;
      this.app.services.notifications.show(
        "Boutiquier mis à jour avec succès",
        "success"
      );

      this.app.eventBus.publish("boutiquiers:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la mise à jour",
        "error"
      );
      throw error;
    }
  }

  async #deleteBoutiquier(id) {
    try {
      console.log(id);

      const confirmed = await this.showDeleteConfirmation();
      if (!confirmed) return;

      await this.service.softDeleteBoutiquier(id);
      this.cache.boutiquiers = null;

      this.app.services.notifications.show(
        "Boutiquier désactivé avec succès",
        "success"
      );

      this.app.eventBus.publish("boutiquiers:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  async #restoreBoutiquier(id) {
    try {
      const confirmed = await this.showRestoreConfirmation();
      if (!confirmed) return;

      await this.service.restoreBoutiquier(id);
      this.cache.boutiquiers = null;

      this.app.services.notifications.show(
        "Boutiquier restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("boutiquiers:updated");
    } catch (error) {
      this.handleActionError(error, "restauration");
    }
  }

  async showDeleteConfirmation() {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmer la désactivation",
        content: "Êtes-vous sûr de vouloir désactiver ce boutiquier ?",
        confirmText: "Désactiver",
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  async showRestoreConfirmation() {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmer la restauration",
        content: "Êtes-vous sûr de vouloir restaurer ce boutiquier ?",
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

  #formatStats(rawStats) {
    return {
      total: rawStats.length,
      active: rawStats.filter((b) => !b.deleted).length,
      deleted: rawStats.filter((b) => b.deleted).length,
    };
  }
}
