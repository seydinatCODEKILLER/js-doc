export class AbstractService {
  constructor({ api }) {
    this.api = api;
  }

  async generateId(endpoint) {
    try {
      const items = await this.api.get(endpoint);
      if (!Array.isArray(items) || items.length === 0) {
        return 1;
      }

      const ids = items.map((item) => parseInt(item.id, 10)).filter(Boolean);
      const maxId = Math.max(...ids);

      return maxId + 1;
    } catch (error) {
      console.error("Erreur lors de la génération de l'ID:", error);
      throw new Error("Impossible de générer un nouvel ID");
    }
  }

  async getActorByIdUser(id, entity) {
    try {
      const actors = await this.api.get(`/${entity}`);
      return actors.find((actor) => actor.id_utilisateur == id);
    } catch (error) {
      console.error("Erreur lors de la recuperation:", error);
      throw new Error("Erreur lors de la recuperation");
    }
  }
}
