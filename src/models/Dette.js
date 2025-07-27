export class Dette {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.id_boutiquier = data.id_boutiquier || null;
    this.id_client = data.id_client || null;
    this.montant = Number(data.montant) || 0;
    // Fixée automatiquement à la création
    this.date_demande = new Date().toISOString().split("T")[0];

    // Ne doit pas être remplie tant que la dette n'est pas traitée
    this.date_traitement = data.date_traitement || null;

    // Par défaut en attente
    this.statut = data.statut || "en_attente";
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
      statut: this.statut
    };
  }
}
