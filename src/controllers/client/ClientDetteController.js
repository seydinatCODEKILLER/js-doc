

export class ClientDetteController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("client_dette_services");
    this.dettes = [];
    this.client = null;
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

      const clientId = await this.getClientId();
      const dettes = await this.service.getDetteByClient(clientId);
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
    try {
      const clientId = await this.getClientId();
      const id_boutiquier = await this.service.getBoutiquierByClientId(
        clientId
      );
      const detteData = {
        ...data,
        id_client: clientId,
        id_boutiquier,
        items: data.produits.map((p) => ({
          productId: p.id,
          quantity: p.quantite,
          unitPrice: p.prix,
          subtotal: p.sousTotal,
        })),
      };

      console.log(detteData);

      await this.service.createDette(detteData);
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la désactivation",
        "error"
      );
      throw error;
    }
  }

  async getClientId() {
    if (!this.client) {
      const userId = this.app.store.state.user.id;
      const client = await this.service.getActorByIdUser(userId, "client");
      if (!client) throw new Error("client non trouvé");
      this.client = client;
    }
    return this.client.id;
  }
}
