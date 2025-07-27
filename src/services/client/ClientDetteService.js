import { AbstractService } from "../../app/core/AbstractService.js";
import { Dette } from "../../models/Dette.js";

export class ClientDetteService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
    this.endpoint = "/dettes";
  }

  async getDetteByClient(clientId) {
    return this.api.get(`${this.endpoint}?id_client=${clientId}&statut=accepted`);
  }

  async createDette(data) {

  try {
    const idDette = await this.generateId(`${this.endpoint}`);

    const dette = new Dette({ ...data, id: idDette });
        console.log("dette",dette);
        
        const detteData = dette.toJSON();
        console.log("detteData",detteData);

    const detteResponse = await this.api.post(`${this.endpoint}`, {
      id: String(idDette),
      ...detteData,
    });
    console.log("detteReponse",detteResponse);
    

    return detteResponse;
  } catch (error) {
    throw error;
  }
}

}
