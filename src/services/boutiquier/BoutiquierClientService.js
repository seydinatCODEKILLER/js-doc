import { AbstractService } from "../../app/core/AbstractService.js";
import { Client } from "../../models/Client.js";

export class BoutiquierClientService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getClientsByBoutiquier(boutiquierId) {
    try {
      const [utilisateurs, clients, associations, allAssociations] =
        await Promise.all([
          this.api.get("/utilisateurs"),
          this.api.get("/client"),
          this.api.get(`/boutiquier_client?id_boutiquier=${boutiquierId}`),
          this.api.get("/boutiquier_client"),
        ]);

      const associationCountMap = new Map();
      allAssociations.forEach((assoc) => {
        const count = associationCountMap.get(assoc.id_client) || 0;
        associationCountMap.set(assoc.id_client, count + 1);
      });

      return associations.map((assoc) => {
        const client = clients.find((c) => c.id == assoc.id_client);
        const utilisateur = utilisateurs.find(
          (u) => u.id == client?.id_utilisateur
        );

        return {
          ...utilisateur,
          id_client: client?.id,
          has_account: client?.has_account || false,
          date_association: assoc.date_association,
          boutiquiers_count: associationCountMap.get(client?.id) || 0,
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      throw new Error("Impossible de récupérer les clients de ce boutiquier");
    }
  }

  async createClient(data, id_boutiquier) {
    try {
      // if (await this.emailExists(data.email)) {
      //   throw new Error("Cet email est déjà utilisé");
      // }

      if (await this.phoneExists(data.telephone)) {
        throw new Error("Ce numéro est déjà utilisé");
      }
      const idUtilisateur = String(await this.generateId("/utilisateurs"));
      const idClient = String(await this.generateId("/client"));

      const client = data.has_account
        ? Client.createClientAvecCompte({ ...data, id: idUtilisateur })
        : Client.createClientSansCompte({ ...data, id: idUtilisateur });

      const { utilisateur, client: clientData } = client.toApiFormat();
      const [userResponse, clientResponse] = await Promise.all([
        this.api.post("/utilisateurs", {
          id: idUtilisateur,
          ...utilisateur,
        }),
        this.api.post("/client", {
          id: idClient,
          ...clientData,
          id_utilisateur: idUtilisateur,
        }),
      ]);
      if (id_boutiquier) {
        const idBoutiquier_client = String(
          await this.generateId("/boutiquier_client")
        );
        await Client.addBoutiquier(
          idBoutiquier_client,
          id_boutiquier,
          idClient,
          this.api
        );
      }
      return {
        ...userResponse,
        ...clientResponse,
        has_account: client.has_account,
      };
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw new Error(`Échec de la création du client: ${error.message}`);
    }
  }

  async updateClient(id, data, id_boutiquier) {
    try {
      const updatePayload = {
        utilisateur: {
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          avatar: data.avatar,
        },
        client: {
          has_account: data.has_account,
        },
      };

      if (data.has_account) {
        updatePayload.utilisateur.email = data.email;
        if (data.password?.trim()) {
          updatePayload.utilisateur.password = data.password;
        }
      } else {
        updatePayload.utilisateur.email = "";
        updatePayload.utilisateur.password = "";
      }

      const [userResponse, clientResponse] = await Promise.all([
        this.api.patch(`/utilisateurs/${id}`, updatePayload.utilisateur),
        this.api.patch(`/client/${data.id_client}`, updatePayload.client),
      ]);

      if (id_boutiquier) {
        const existingAssociations = await this.api.get(
          `/boutiquier_client?id_boutiquier=${id_boutiquier}`
        );

        await Promise.all(
          existingAssociations
            .filter((a) => a.id_client == data.id_client)
            .map((assoc) => this.api.delete(`/boutiquier_client/${assoc.id}`))
        );

        const idBoutiquierClient = String(
          await this.generateId("/boutiquier_client")
        );

        await this.api.post("/boutiquier_client", {
          id: idBoutiquierClient,
          id_boutiquier,
          id_client: data.id_client,
          date_association: new Date().toISOString().split("T")[0],
        });
      }

      return {
        utilisateur: userResponse,
        client: clientResponse,
      };
    } catch (error) {
      console.error("Erreur dans updateClient:", error);
      throw new Error(`Échec de la mise à jour du client: ${error.message}`);
    }
  }

  async softDeleteClient(id) {
    try {
      const response = await this.api.patch(`/utilisateurs/${id}`, {
        deleted: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async restoreClient(id) {
    try {
      return await this.api.patch(`/utilisateurs/${id}`, {
        deleted: false,
      });
    } catch (error) {
      throw error;
    }
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
}
