import { NotificationStore } from "../app/core/NotificationStore.js";
import { showNotification } from "../components/notifications/Notification.js";

export class NotificationService {
  constructor(app) {
    this.app = app;
    this.store = new NotificationStore();
    this.init();
  }

  init() {
    this.store.displayStoredNotifications();
    this.unsubTransient = this.store.subscribeTransient((notification) => {
      showNotification(notification.message, notification.type);
    });

    this.unsubPersistent = this.store.subscribePersistent((notification) => {
      showNotification(notification.message, notification.type);
    });
  }

  show(message, type = "info", persistent = false) {
    if (persistent) {
      this.store.showPersistent(message, type);
    } else {
      this.store.showTransient(message, type);
    }
  }

  destroy() {
    this.unsubTransient?.();
    this.unsubPersistent?.();
  }
}
