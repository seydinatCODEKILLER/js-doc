export class AdminController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("admins");
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
      this.clearCache();
      this.app.eventBus.publish("boutiquiers:updated");
      this.app.services.notifications.show("Boutiquier créé avec succès", "success");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la création",
        "error"
      );
      throw error;
    }
  }

  async updateBoutiquier(id, data) {
    try {
      const result = await this.service.updateBoutiquier(id, data);
      this.clearCache();
      this.app.eventBus.publish("boutiquiers:updated");
      this.app.services.notifications.show("Boutiquier mis à jour avec succès", "success");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la mise à jour",
        "error"
      );
      throw error;
    }
  }

  async deleteBoutiquier(id) {
    try {
      await this.service.softDeleteBoutiquier(id);
      this.clearCache();
      this.app.eventBus.publish("boutiquiers:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  async restoreBoutiquier(id) {
    try {
      await this.service.restoreBoutiquier(id);
      this.clearCache();
      this.app.eventBus.publish("boutiquiers:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la restauration",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.boutiquiers = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }

  #formatStats(rawStats) {
    return {
      total: rawStats.length,
      active: rawStats.filter((b) => !b.deleted).length,
      deleted: rawStats.filter((b) => b.deleted).length,
    };
  }
}
