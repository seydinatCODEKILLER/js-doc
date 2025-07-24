export class NotificationStore {
  constructor() {
    this.transientListeners = [];
    this.persistentListeners = [];
    this.displayStoredNotifications();
  }

  showTransient(message, type = "info") {
    this.emitTransient({ message, type });
  }

  showPersistent(message, type = "info") {
    const notification = { message, type, timestamp: Date.now() };
    localStorage.setItem("pendingNotifications", JSON.stringify(notification));
    this.emitPersistent(notification);
  }

  displayStoredNotifications() {
    const stored = localStorage.getItem("pendingNotifications");
    if (stored) {
      try {
        const notification = JSON.parse(stored);
        this.emitPersistent(notification);
        localStorage.removeItem("pendingNotifications");
      } catch (e) {
        console.error("Failed to parse stored notifications", e);
      }
    }
  }

  subscribeTransient(listener) {
    this.transientListeners.push(listener);
    return () => {
      this.transientListeners = this.transientListeners.filter(
        (l) => l !== listener
      );
    };
  }

  subscribePersistent(listener) {
    this.persistentListeners.push(listener);
    return () => {
      this.persistentListeners = this.persistentListeners.filter(
        (l) => l !== listener
      );
    };
  }

  emitTransient(notification) {
    this.transientListeners.forEach((listener) => listener(notification));
  }

  emitPersistent(notification) {
    this.persistentListeners.forEach((listener) => listener(notification));
  }
}

export const notificationStore = new NotificationStore();
