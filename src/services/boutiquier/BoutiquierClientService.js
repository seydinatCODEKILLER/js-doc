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

  async createClient(data) {
    try {
      const idUtilisateur = String(await this.generateId("/utilisateurs"));
      const idClient = String(await this.generateId("/client"));

      const client = data.has_account
        ? Client.createClientAvecCompte({ ...data, id: idUtilisateur })
        : Client.createClientSansCompte({ ...data, id: idUtilisateur });

      const { utilisateur, client: clientData } = client.toApiFormat();
      const [userResponse, clientResponse] = await Promise.all([
        this.api.post("/utilisateurs", {
          id: String(idUtilisateur),
          ...utilisateur,
        }),
        this.api.post("/client", {
          id: String(idClient),
          ...clientData,
          id_utilisateur: idUtilisateur,
        }),
      ]);
      if (data.id_boutiquier) {
        const idBoutiquier_client = String(
          await this.generateId("/boutiquier_client")
        );
        await Client.addBoutiquier(
          idBoutiquier_client,
          data.id_boutiquier,
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

  // async updateClient(id, data) {
  //   try {
  //     console.log("Données reçues pour mise à jour:", data);

  //     // 1. Préparation des données de mise à jour
  //     const updates = {
  //       utilisateur: {
  //         nom: data.nom,
  //         prenom: data.prenom,
  //         telephone: data.telephone,
  //         avatar: data.avatar,
  //         email: data.has_account ? data.email : "",
  //         password:
  //           data.has_account && data.password ? data.password : "",
  //           role: data.role
  //       },
  //       client: {
  //         id_utilisateur: id,
  //         has_account: data.has_account,
  //       },
  //     };

  //     // 2. Mise à jour des entités en parallèle
  //     const [userResponse, clientResponse] = await Promise.all([
  //       this.api.patch(`/utilisateurs/${id}`, updates.utilisateur),
  //       this.api.patch(`/client/${data.id_client}`, updates.client),
  //     ]);

  //     // 3. Gestion des associations boutiquiers
  //     if (data.id_boutiquier) {
  //       // Suppression des anciennes associations
  //       const currentAssociations = await this.api.get(
  //         `/boutiquier_client?id_client=${data.id_client}`
  //       );

  //       await Promise.all(
  //         currentAssociations.map((assoc) =>
  //           Client.removeBoutiquier(
  //             data.id_client,
  //             assoc.id_boutiquier,
  //             this.api
  //           )
  //         )
  //       );

  //       // Création de la nouvelle association
  //       const idBoutiquierClient = String(
  //         await this.generateId("/boutiquier_client")
  //       );
  //       await Client.addBoutiquier(
  //         idBoutiquierClient,
  //         data.id_boutiquier,
  //         data.id_client,
  //         this.api
  //       );
  //     }

  //     console.log("Mise à jour réussie");
  //      return {
  //        success: true,
  //        utilisateur: userResponse,
  //        client: clientResponse,
  //      };
  //   } catch (error) {
  //     console.error("Échec de la mise à jour:", error);
  //     throw new Error(`Échec de la mise à jour: ${error.message}`);
  //   }
  // }

  async updateClient(id, data) {
    try {


      const updatePayload = {
        utilisateur: {},
        client: {},
      };

      // Données utilisateur
      updatePayload.utilisateur = {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        avatar: data.avatar,
        role: "client",
      };

      // Gestion spécifique du compte
      if (data.has_account) {
        updatePayload.utilisateur.email = data.email ;
        if (data.password) {
          updatePayload.utilisateur.password = data.password; // À hasher côté serveur
        }
      } else {
        updatePayload.utilisateur.email = "";
        updatePayload.utilisateur.password = "";
      }

      updatePayload.client = {
        has_account: data.has_account,
      };

      const [userResponse, clientResponse] = await Promise.all([
        this.api.patch(
          `/utilisateurs/${id}`,
          updatePayload.utilisateur
        ),
        this.api.patch(`/client/${data.id_client}`, updatePayload.client),
      ]);

      if (
        data.id_boutiquier 
      ) {
        const existingAssociations = await this.api.get(
          `/boutiquier_client?id_client=${data.id_client}`
        );

        await Promise.all(
          existingAssociations.map((assoc) =>
            this.api.delete(`/boutiquier_client/${assoc.id}`)
          )
        );
        const idBoutiquierClient = String(await this.generateId("/boutiquier_client"));
        await this.api.post("/boutiquier_client", {
          id: idBoutiquierClient,
          id_boutiquier: data.id_boutiquier,
          id_client: data.id_client, 
          date_association: new Date().toISOString().split("T")[0]})
      }


      return {
        ...userResponse,
        ...clientResponse,
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
}
