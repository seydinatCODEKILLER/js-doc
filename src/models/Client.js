import { User } from "./User.js";

export class Client extends User {
  constructor(data = {}) {
    super(data);
    this.role = "client";
    this.has_account = data.has_account || (data.email && data.password)
  }

  static createClientSansCompte(data = {}) {
    const clientData = {
      ...data,
      email: "",
      password: "",
      has_account: false,
    };
    return new Client(clientData);
  }

  static createClientAvecCompte(data = {}) {
    if (!data.email || !data.password) {
      throw new Error(
        "Un client avec compte nécessite un email et un mot de passe"
      );
    }
    return new Client({
      ...data,
      has_account: true,
    });
  }

  static async addBoutiquier(id,boutiquierId,clientId, apiService) {
    try {
      await apiService.post("/boutiquier_client", {
        id: id,
        id_boutiquier: boutiquierId,
        id_client: clientId,
        date_association: new Date().toISOString().split("T")[0],
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout du boutiquier:", error);
      return false;
    }
  }

  static async removeBoutiquier(id_client,boutiquierId, apiService) {
    try {
      const associations = await apiService.get(
        `/boutiquier_client?id_boutiquier=${boutiquierId}&id_client=${id_client}`
      );

      if (associations.length > 0) {
        await apiService.delete(`/boutiquier_client/${associations[0].id}`);
      }
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du boutiquier:", error);
      return false;
    }
  }

  toJSON() {
    const baseJson = super.toJSON();

    return {
      ...baseJson,
      has_account: this.has_account,
    };
  }

  toApiFormat() {
    return {
      utilisateur: {
        ...super.toJSON(),
        role: this.role,
      },
      client: {
        id_utilisateur: this.id,
        has_account: this.has_account,
      },
    };
  }
}
