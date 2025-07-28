export class Dette {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.id_boutiquier = data.id_boutiquier || null;
    this.id_client = data.id_client || null;
    this.montant = Number(data.montant) || 0;
    this.date_demande = new Date().toISOString().split("T")[0];
    this.date_traitement = data.date_traitement || null;
    this.statut = data.statut || "en_attente";
    this.items = data.items || [];
  }

  generateId() {
    return (
      "dette_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5)
    );
  }

  toJSON() {
    return {
      id: this.id,
      id_boutiquier: this.id_boutiquier,
      id_client: this.id_client,
      montant: this.montant,
      date_demande: this.date_demande,
      date_traitement: this.date_traitement,
      statut: this.statut,
      items: this.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };
  }

  calculateTotal() {
    this.montant = this.items.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    return this.montant;
  }
}
