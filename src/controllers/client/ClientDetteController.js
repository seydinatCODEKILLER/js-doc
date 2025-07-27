import { Modal } from "../../components/modal/Modal.js";

export class ClientDetteController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("client_dette_services");
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
      const client = await this.service.getActorByIdUser(userId, "client");

      if (!client) {
        throw new Error("client non trouvé");
      }

      const dettes = await this.service.getDetteByClient(client.id);
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

  async createDette(data) {
    return this.service.createDette(data);
  }
  catch(error) {
    this.app.services.notifications.show(
      error.message || "Erreur lors de la désactivation",
      "error"
    );
    throw error;
  }
}
