export class Article {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.nom = data.nom || "";
    this.description = data.description || "";
    this.prix = data.prix || 0;
    this.image = data.image || "";
    this.quantite = data.quantite || 0;
    this.delete.d = data.deleted || false;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      nom: this.nom,
      description: this.description,
      prix: this.prix,
      image: this.image,
      quantite: this.quantite,
      delete: this.deleted,
    };
  }
}
