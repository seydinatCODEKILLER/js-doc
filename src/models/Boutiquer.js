import { User } from "./User.js";

export class Boutiquier extends User {
  constructor(data = {}) {
    super(data);
    this.role = "boutiquier";
  }

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}
