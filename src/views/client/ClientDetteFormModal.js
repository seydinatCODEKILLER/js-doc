// import { Modal } from "../../components/modal/Modal.js";
// import { validators } from "../../utils/Validator.js";
// import { AbstractClientModal } from "../boutiquier/client/AbstractClientModal.js";

// export class ClientDetteFormModal extends AbstractClientModal {
//   constructor(app, config = {}) {
//     super(app, {
//       ...config,
//       title: "Nouvelle demande de dette",
//     });
//     this.produits = config.produits || [];
//     this.selectedProduits = [];
//   }

//   getFormTemplate() {
//     return `
//       <div class="bg-white rounded-lg p-4 shadow-md max-w-2xl mx-auto">
//         <h2 class="text-xl font-semibold mb-4">Nouvelle demande de dette</h2>
        
//         <input type="text" id="searchProduit" placeholder="Rechercher un produit..." 
//                class="w-full border p-2 rounded mb-3" />

//         <ul id="produitSuggestions" class="border rounded mb-4 max-h-40 overflow-y-auto"></ul>

//         <div id="selectedProduitsList" class="space-y-2 mb-4"></div>

//         <div class="flex justify-between items-center font-bold">
//           <span>Total :</span>
//           <span id="montantTotal">0 FCFA</span>
//         </div>
//       </div>
//     `;
//   }

//   getFooterButtons() {
//     return [
//       {
//         text: "Annuler",
//         className: "btn-ghost",
//         action: "cancel",
//         onClick: () => this.close(),
//       },
//       {
//         text: "Soumettre la demande",
//         className: "btn-primary",
//         action: "submit",
//         onClick: (e) => this.handleSubmit(e),
//         closeOnClick: false,
//       },
//     ];
//   }

//   setupEvents() {
//     super.setupEvents();

//     const searchInput = this.form.querySelector("#searchProduit");
//     const suggestionList = this.form.querySelector("#produitSuggestions");

//     searchInput.addEventListener("input", () => {
//       const term = searchInput.value.trim().toLowerCase();
//       suggestionList.innerHTML = "";
//       if (!term) return;

//       const filtered = this.produits.filter(
//         (p) =>
//           p.nom.toLowerCase().includes(term) &&
//           !this.selectedProduits.find((sp) => sp.id === p.id)
//       );

//       for (const produit of filtered) {
//         const li = document.createElement("li");
//         li.textContent = produit.nom;
//         li.className = "cursor-pointer p-2 hover:bg-gray-200";
//         li.addEventListener("click", () => {
//           this.addProduit(produit);
//           searchInput.value = "";
//           suggestionList.innerHTML = "";
//         });
//         suggestionList.appendChild(li);
//       }
//     });
//   }

//   addProduit(produit) {
//     produit.quantiteDemandee = 1;
//     this.selectedProduits.push(produit);
//     this.renderSelectedProduits();
//   }

//   renderSelectedProduits() {
//     const listContainer = this.form.querySelector("#selectedProduitsList");
//     const totalSpan = this.form.querySelector("#montantTotal");

//     listContainer.innerHTML = "";

//     for (const produit of this.selectedProduits) {
//       const div = document.createElement("div");
//       div.className = "flex items-center gap-2";

//       div.innerHTML = `
//         <span class="flex-1">${produit.nom}</span>
//         <input type="number" min="1" max="${produit.quantite}" 
//                value="${produit.quantiteDemandee}" 
//                class="w-20 border p-1 rounded" />
//         <span class="w-24 text-right">${produit.prix * produit.quantiteDemandee} FCFA</span>
//         <button class="text-red-500 font-bold">X</button>
//       `;

//       const input = div.querySelector("input");
//       const btn = div.querySelector("button");

//       input.addEventListener("input", (e) => {
//         let val = parseInt(e.target.value);
//         if (val > produit.quantite) val = produit.quantite;
//         if (val < 1) val = 1;
//         produit.quantiteDemandee = val;
//         this.renderSelectedProduits();
//       });

//       btn.addEventListener("click", () => {
//         this.selectedProduits = this.selectedProduits.filter((p) => p.id !== produit.id);
//         this.renderSelectedProduits();
//       });

//       listContainer.appendChild(div);
//     }

//     totalSpan.textContent = `${this.getMontantTotal()} FCFA`;
//   }

//   getMontantTotal() {
//     return this.selectedProduits.reduce(
//       (sum, p) => sum + p.prix * p.quantiteDemandee,
//       0
//     );
//   }

//   async handleSubmit(e) {
//     e.preventDefault();

//     if (this.selectedProduits.length === 0) {
//       this.app.services.notifications.show(
//         "Veuillez ajouter au moins un produit",
//         "error"
//       );
//       return;
//     }

//     this.modal.setButtonLoading("submit", true, "Envoi en cours...");

//     try {
//       const dette = {
//         date_demande: new Date().toISOString().split("T")[0],
//         statut: "en_attente",
//         produits: this.selectedProduits.map((p) => ({
//           id: p.id,
//           nom: p.nom,
//           prix: p.prix,
//           quantite: p.quantiteDemandee,
//           sousTotal: p.prix * p.quantiteDemandee,
//         })),
//         montant: this.getMontantTotal(),
//       };

//       if (this.config.onSubmit) {
//         await this.config.onSubmit(dette);
//       }
      
//       this.close();
//     } catch (error) {
//       this.handleSubmitError(error);
//     } finally {
//       this.modal.setButtonLoading("submit", false);
//     }
//   }
// }

import { AbstractDetteModal } from "./AbstractDetteModal.js";

export class ClientDetteFormModal extends AbstractDetteModal {
  constructor(app) {
    super(app, {
      title: "Demander une dette",
    });
  }

  getSubmitButtonText() {
    return "Envoyer la demande";
  }

  async processFormData(formData) {
    // Ici, on appelle le controller de dette pour créer la demande
    await this.controller.createDette(formData);

    // Tu peux notifier que la dette a été ajoutée
    this.app.eventBus.publish("dette:created");

    // Message de confirmation (facultatif)
    this.app.services.notifications.show("Demande de dette envoyée", "success");
  }
}
