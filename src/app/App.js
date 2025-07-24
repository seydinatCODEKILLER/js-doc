import { AuthLayout } from "../layout/AuthLayout.js";
import { NotificationService } from "../config/NotificationService.js";
import StorageService from "../config/StorageService.js";
import { hydrateStoreFromLocalStorage } from "../utils/HydrateStore.js";
import { EventBus } from "./core/EventBus.js";
import Router from "./core/Router.js";
import { Store } from "./core/Store.js";
import ApiService from "../config/ApiService.js";
import { AuthService } from "../services/auth/AuthService.js";
import { AuthController } from "../controllers/AuthController.js";
import { authRoutes } from "../routes/auth.routes.js";
import { AdminService } from "../services/admin/AdminService.js";
import { AdminController } from "../controllers/AdminController.js";
import { adminRoutes } from "../routes/admin.routes.js";
import { AdminLayout } from "../layout/AdminLayout.js";

export class App {
  constructor(config) {
    this.eventBus = new EventBus();
    this.store = new Store(config.initialState || {});

    this.services = {
      api: new ApiService(config.apiBaseUrl),
      storage: new StorageService(),
      notifications: new NotificationService(this),
    };

    this.services.auth = new AuthService({
      api: this.services.api,
      storage: this.services.storage,
    });

    //les services de l'applications

    this.services.admins = new AdminService({
      api: this.services.api,
      storage: this.services.storage,
    });

    //les controllers de l'applications

    this.controllers = {
      Auth: new AuthController(this),
      admin: new AdminController(this)
    };

    this.router = new Router(this, {
      mode: "history",
      scrollRestoration: "manual",
    });

    this.router.addLayout("auth", AuthLayout);
    this.router.addLayout("admin", AdminLayout)
    this.router.addRoutes(authRoutes);
    this.router.addRoutes(adminRoutes)

    this.initModules();
    hydrateStoreFromLocalStorage(this.store, this.services.storage);
    this.router.start();
  }

  initModules() {}

  getService(name) {
    return this.services[name];
  }

  getController(name) {
    return this.controllers[name];
  }
}
