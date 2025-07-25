import { AbstractService } from "../../app/core/AbstractService.js";

export class BoutiquierDetteService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
    this.endpoint = "/dettes";
  }

  async acceptDette(id) {
    return this.api.patch(`${this.endpoint}/${id}`, {
      statut: "accepted",
      date_traitement: new Date().toISOString().split("T")[0],
    });
  }

  async rejectDette(id) {
    return this.api.patch(`${this.endpoint}/${id}`, {
      statut: "rejected",
      date_traitement: new Date().toISOString().split("T")[0],
    });
  }

  async getDetteByBoutiquier(boutiquierId) {
    return this.api.get(`${this.endpoint}?id_boutiquier=${boutiquierId}`);
  }
}
