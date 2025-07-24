export default class StorageService {
  get(key) {
    const item = localStorage.getItem(key);
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  }

  set(key, value) {
    const toStore = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, toStore);
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}
