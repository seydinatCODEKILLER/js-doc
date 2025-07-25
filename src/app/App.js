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
import { ProductService } from "../services/boutiquier/produit/ProduitService.js";
import { ProductController } from "../controllers/boutiquier/ProductController.js";
import { boutiquierRoutes } from "../routes/boutiquier_product.routes.js";
import { BoutiquierLayout } from "../layout/BoutiquierLayout.js";
import { ArticleService } from "../services/boutiquier/article/ArticleService.js";
import { ArticleController } from "../controllers/boutiquier/ArticleController.js";
import { BoutiquierClientService } from "../services/boutiquier/BoutiquierClientService.js";
import { BoutiquierClientController } from "../controllers/boutiquier/BoutiquierClientController.js";
import { BoutiquierDetteService } from "../services/boutiquier/BoutiquierDetteService.js";
import { BoutiquierDetteController } from "../controllers/boutiquier/BoutiquierDetteController.js";
import { errorRoutes } from "../routes/error.routes.js";
import { ErrorLayout } from "../layout/ErrorLayout.js";
import { ClientArticleService } from "../services/client/ClientArticleService.js";
import { ProduitController } from "../controllers/client/ProduitController.js";
import { clientRoutes } from "../routes/client.routes.js";
import { clientLayout } from "../layout/ClientLayout.js";

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

    this.services.products = new ProductService({
      api: this.services.api,
      storage: this.services.storage,
    });

    this.services.articles = new ArticleService({
      api: this.services.api,
      storage: this.services.storage,
    });

    this.services.boutiquier_client_services = new BoutiquierClientService({
      api: this.services.api,
      storage: this.services.storage,
    });

    this.services.boutiquier_dette_services = new BoutiquierDetteService({
      api: this.services.api,
      storage: this.services.storage,
    });

    this.services.client_produits = new ClientArticleService({
      api: this.services.api,
      storage: this.services.storage,
    });


    //les controllers de l'applications

    this.controllers = {
      Auth: new AuthController(this),
      admin: new AdminController(this),
      product: new ProductController(this),
      article: new ArticleController(this),
      boutiquier_client: new BoutiquierClientController(this),
      boutiquier_dette: new BoutiquierDetteController(this),
      client_produit: new ProduitController(this)
    };

    this.router = new Router(this, {
      mode: "history",
    });

    this.router.addLayout("auth", AuthLayout);
    this.router.addLayout("admin", AdminLayout)
    this.router.addLayout("boutiquier", BoutiquierLayout)
    this.router.addLayout("error", ErrorLayout)
    this.router.addLayout("client", clientLayout)
    this.router.addRoutes(authRoutes);
    this.router.addRoutes(adminRoutes)
    this.router.addRoutes(clientRoutes)
    this.router.addRoutes(boutiquierRoutes)
    this.router.addRoutes(errorRoutes)

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
