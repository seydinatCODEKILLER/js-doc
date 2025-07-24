export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  /**
   * Récupère l'état actuel
   * @return {object}
   */
  getState() {
    return this.state;
  }

  /**
   * Met à jour l'état
   * @param {object} newState - Nouvel état ou fonction de mise à jour
   */
  setState(newState) {
    if (typeof newState === "function") {
      this.state = { ...this.state, ...newState(this.state) };
    } else {
      this.state = { ...this.state, ...newState };
    }
    this.notifyListeners();
  }

  /**
   * Abonne un listener aux changements d'état
   * @param {function} listener - Fonction à exécuter lors des changements
   * @return {function} Fonction pour se désabonner
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
