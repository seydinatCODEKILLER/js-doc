import { AbstractService } from "../../app/core/AbstractService.js";
import { Boutiquier } from "../../models/Boutiquer.js";


export class AdminService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getAllBoutiquiers() {
    const users = await this.api.get("/utilisateurs");
    const boutiquiers = users.filter((u) => u.role === "boutiquier");
    return boutiquiers;
  }

  async emailExists(email) {
    const users = await this.api.get("/utilisateurs");
    return users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  }

  async phoneExists(telephone) {
    if (!telephone) return false;
    const users = await this.api.get("/utilisateurs");
    return users.some((u) => u.telephone === telephone);
  }

  async createBoutiquier(data) {
    try {
          if (await this.emailExists(data.email)) {
            throw new Error("Cet email est déjà utilisé");
          }

          if (await this.phoneExists(data.telephone)) {
            throw new Error("Ce numéro est déjà utilisé");
          }

      const idUtilisateur = String(await this.generateId("/utilisateurs"));
      const idBoutiquier = String(await this.generateId("/boutiquier"));

      const boutiquier = new Boutiquier({ ...data, id: idUtilisateur });
      const userData = boutiquier.toJSON();

      const [userResponse, _] = await Promise.all([
        this.api.post("/utilisateurs", {
          id: idUtilisateur,
          ...userData,
        }),
        this.api.post("/boutiquier", {
          id: idBoutiquier,
          id_utilisateur: idUtilisateur,
        }),
      ]);

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  async updateBoutiquier(id, data) {
    try {
      const userResponse = await this.api.patch(`/utilisateurs/${id}`, data);
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  async getBoutiquier(id) {
    try {
      return await this.api.get(`/utilisateurs/${id}`);
    } catch (error) {
      throw error;
    }
  }

  async softDeleteBoutiquier(id) {
    try {
      const response = await this.api.patch(`/utilisateurs/${id}`, {
        deleted: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async restoreBoutiquier(id) {
    try {
      return await this.api.patch(`/utilisateurs/${id}`, {
        deleted: false,
      });
    } catch (error) {
      throw error;
    }
  }
}
