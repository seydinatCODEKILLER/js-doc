export class User {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.nom = data.nom || "";
    this.prenom = data.prenom || "";
    this.email = data.email || "";
    this.password = data.password || "";
    this.avatar = data.avatar || "";
    this.telephone = data.telephone || "";
    this.role = data.role || "client";
    this.deleted = data.deleted || false;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      telephone: this.telephone,
      role: this.role,
      delete: this.deleted,
    };
  }
}
