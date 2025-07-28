import { AbstractService } from "../../app/core/AbstractService.js";
import { Dette } from "../../models/Dette.js";

export class ClientDetteService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
    this.endpoint = "/dettes";
  }

  async getDetteByClient(clientId) {
    return this.api.get(`${this.endpoint}?id_client=${clientId}`);
  }

  async createDette(data) {
    try {
      const idDette = String(await this.generateId(`${this.endpoint}`));
      const dette = new Dette({...data, id: idDette});

      const detteResponse = await this.api.post(`${this.endpoint}`, {
        id: idDette,
        ...dette.toJSON(),
      });

      return detteResponse;
    } catch (error) {
      throw error;
    }
  }

  async getBoutiquierByClientId(clientId) {
    const response = await this.api.get(
      `/boutiquier_client?id_client=${clientId}`
    );
    const association = response[0];
    if (!association) {
      throw new Error("Aucun boutiquier associé à ce client.");
    }
    return association.id_boutiquier;
  }
}
