
export class BoutiquierClientController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("boutiquier_client_services");
    this.clients = [];
    this.boutiquier = null;
    this.cache = {
      clients: null,
      lastUpdated: null,
    };
  }

  async loadClients(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.clients && this.isCacheValid()) {
        return this.cache.clients;
      }

      const id_boutiquier = await this.getBoutiquierId();
      const clients = await this.service.getClientsByBoutiquier(id_boutiquier);

      this.cache.clients = clients;
      this.cache.lastUpdated = Date.now();

      return clients;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les clients",
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

  async createClient(formData) {
    try {
      const id_boutiquier = await this.getBoutiquierId();
      const result = await this.service.createClient(
        formData,
        id_boutiquier
      );

      this.clearCache();
      this.app.services.notifications.show(
        "client créé avec succèss",
        "success"
      );

      this.app.eventBus.publish("client:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la création",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.clients = null;
  }

  async updateClient(id, data) {
    try {
      const id_boutiquier = await this.getBoutiquierId();
      const result = await this.service.updateClient(
        id,
        data,
        id_boutiquier
      );
      this.clearCache();
      this.app.services.notifications.show(
        "client mis à jour avec succès",
        "success"
      );

      this.app.eventBus.publish("client:updated");
      return result;
    } catch (error) {
      console.log(error);
      this.app.services.notifications.show(
        error.message || "Erreur lors de la mise à jour",
        "error"
      );
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      await this.service.softDeleteClient(id);
      this.clearCache();

      this.app.services.notifications.show(
        "client désactivé avec succès",
        "success"
      );
      this.app.eventBus.publish("client:updated");
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  async restoreClient(id) {
    try {
      await this.service.restoreClient(id);
      this.clearCache();
      this.app.services.notifications.show(
        "Boutiquier restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("client:updated");
    } catch (error) {
      this.handleActionError(error, "restauration");
    }
  }

  handleActionError(error, actionName) {
    this.app.services.notifications.show(
      error.message || `Erreur lors de la ${actionName}`,
      "error"
    );
    throw error;
  }

  async getBoutiquierId() {
    if (!this.boutiquier) {
      const userId = this.app.store.state.user.id;
      const boutiquier = await this.service.getActorByIdUser(
        userId,
        "boutiquier"
      );
      if (!boutiquier) throw new Error("Boutiquier non trouvé");
      this.boutiquier = boutiquier;
    }
    return this.boutiquier.id;
  }
}
