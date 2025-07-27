export class Product {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.nom = data.nom || "";
    this.prix = data.prix || 0;
    this.quantite = data.quantite || 0;
    this.seuil_alerte = data.seuil_alerte || 5;
    this.image = data.image || null;
    this.id_boutiquier = data.id_boutiquier || null;
    this.article_id = data.article_id || null;
    this.date_creation =
      data.date_creation || new Date().toISOString().split("T")[0];
    this.deleted = data.deleted || false;
  }

  generateId() {
    return (
      "prod_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5)
    );
  }

  toJSON() {
    return {
      id: this.id,
      nom: this.nom,
      prix: Number(this.prix),
      quantite: Number(this.quantite),
      seuil_alerte: Number(this.seuil_alerte),
      image: this.image,
      id_boutiquier: this.id_boutiquier,
      article_id: this.article_id,
      date_creation: this.date_creation,
      deleted: Boolean(this.deleted),
    };
  }

  isLowStock() {
    return this.quantite <= this.seuil_alerte;
  }

  isOutOfStock() {
    return this.quantite <= 0;
  }
}