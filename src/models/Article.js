export class Article {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.titre = data.titre || "";
    this.contenu = data.contenu || "";
    this.id_boutiquier = data.id_boutiquier || null;
    this.date_publication =
      data.date_publication || new Date().toISOString().split("T")[0];
    this.deleted = data.deleted || false;
  }

  generateId() {
    return (
      "art_" + // Préfixe plus approprié pour des articles
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5)
    );
  }
 //c'étais juste pour faire un commit tu peux l'effacer si tu veux",
 //Encore une autre pour pouvoir obtenire tout sur ma nouvelle branch
 
  toJSON() {
    return {
      id: this.id,
      titre: this.titre,
      contenu: this.contenu,
      id_boutiquier: this.id_boutiquier,
      date_publication: this.date_publication,
      deleted: Boolean(this.deleted),
    };
  }
}