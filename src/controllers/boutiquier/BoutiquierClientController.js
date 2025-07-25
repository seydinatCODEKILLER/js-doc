import { Modal } from "../../components/modal/Modal.js";
import { ClientEditModal } from "../../views/boutiquier/client/ClientEditModal.js";

export class BoutiquierClientController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("boutiquier_client_services");
    this.clients = [];
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

      const userId = this.app.store.state.user.id;
      const boutiquier = await this.service.getActorByIdUser(
        userId,
        "boutiquier"
      );

      if (!boutiquier) {
        throw new Error("Boutiquier non trouvé");
      }

      const clients = await this.service.getClientsByBoutiquier(boutiquier.id);
      this.cache.clients = clients;
      this.cache.lastUpdated = Date.now();
      console.log(clients);

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

  async handleClientAction(action, id, actionType) {
    switch (action) {
      case "edit":
        return this.#editClient(id);
      case "toggleStatus":
        return actionType === "delete"
          ? this.#deleteClient(id)
          : this.#restoreClient(id);
      default:
        throw new Error(`Action ${action} non supportée`);
    }
  }

  async createClient(formData) {
    try {
      const result = await this.service.createClient(formData);

      this.cache.clients = null;
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

  async #editClient(id) {
    try {
      console.log(id);
      
      const client = this.cache.clients?.find((b) => b.id == id);
      console.log(client);

      if (!client) {
        throw new Error("client non trouvé");
      }

      const editModal = new ClientEditModal(this.app, client);
      editModal.open();
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de l'édition",
        "error"
      );
    }
  }

  async updateClient(id, data) {
    try {
      console.log(data);

      const result = await this.service.updateClient(id, data);

      this.cache.clients = null;
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

  async #deleteClient(id) {
    try {
      console.log(id);

      const confirmed = await this.showDeleteConfirmation();
      if (!confirmed) return;

      await this.service.softDeleteClient(id);
      this.cache.clients = null;

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

  async #restoreClient(id) {
    try {
      const confirmed = await this.showRestoreConfirmation();
      if (!confirmed) return;

      await this.service.restoreClient(id);
      this.cache.clients = null;

      this.app.services.notifications.show(
        "Boutiquier restauré avec succès",
        "success"
      );
      this.app.eventBus.publish("client:updated");
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
}
