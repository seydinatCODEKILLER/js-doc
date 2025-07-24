class Router {
  constructor(app, config = {}) {
    this.app = app;
    this.routes = [];
    this.layouts = new Map();
    this.currentRoute = null;
    this.previousRoute = null;
    this.currentView = null;
    this.currentLayout = null;
    this.history = window.history;
    this.cache = new Map();

    this.config = {
      root: "/",
      mode: "history",
      scrollRestoration: "manual",
      defaultLayout: "default",
      cacheSize: 10, // Nombre max de vues en cache
      strict: false, // Respect de la casse et slash final
      sensitive: false, // Sensibilité à la casse
      ...config,
    };

    this.init();
  }

  init() {
    if ("scrollRestoration" in this.history) {
      this.history.scrollRestoration = this.config.scrollRestoration;
    }
    window.addEventListener("popstate", this.handleNavigation.bind(this));
    window.addEventListener("hashchange", this.handleNavigation.bind(this));
    document.addEventListener(
      "DOMContentLoaded",
      this.handleNavigation.bind(this)
    );
    document.addEventListener("click", this.handleLinkClick.bind(this));
  }

  /* ==================== */
  /* === GESTION DES LAYOUTS === */
  /* ==================== */
  addLayout(name, component) {
    if (typeof component !== "function") {
      throw new Error("Layout must be a constructor function");
    }
    this.layouts.set(name, component);
    return this;
  }

  getLayout(name) {
    const layout = this.layouts.get(name || this.config.defaultLayout);
    if (!layout) throw new Error(`Layout "${name}" not registered`);
    return layout;
  }

  /* ==================== */
  /* === GESTION DES ROUTES === */
  /* ==================== */
  addRoutes(routes, options = {}) {
    if (!Array.isArray(routes)) routes = [routes];

    routes.forEach((route) => {
      if (!route.path || !route.component) {
        throw new Error("Route must have path and component");
      }

      // Normalisation du chemin
      const normalizedPath = this.normalizeRoutePath(route.path);

      // Compilation de la route
      const compiledRoute = {
        ...route,
        path: normalizedPath,
        meta: { ...options.meta, ...route.meta },
        guards: [...(options.guards || []), ...(route.guards || [])],
        middlewares: [
          ...(options.middlewares || []),
          ...(route.middlewares || []),
        ],
        regex: this.pathToRegex(normalizedPath),
        params: this.extractParams(normalizedPath),
        layout: route.meta?.layout || this.config.defaultLayout,
      };

      // Lazy loading
      if (
        typeof compiledRoute.component === "function" &&
        !compiledRoute.component.prototype
      ) {
        compiledRoute._component = compiledRoute.component;
        compiledRoute.component = null;
      }

      this.routes.push(compiledRoute);
    });

    // Tri des routes pour que les plus spécifiques soient vérifiées en premier
    this.routes.sort((a, b) => {
      // Les routes statiques d'abord
      if (!a.path.includes(":") && b.path.includes(":")) return -1;
      if (a.path.includes(":") && !b.path.includes(":")) return 1;

      // Sinon par longueur de chemin (les plus longues d'abord)
      return b.path.split("/").length - a.path.split("/").length;
    });

    return this;
  }

  /**
   * Normalise le chemin d'une route pour la cohérence
   */
  normalizeRoutePath(path) {
    // Supprime les doubles slashes
    path = path.replace(/\/+/g, "/");

    // Gestion du slash final selon la config strict
    if (this.config.strict) {
      if (!path.endsWith("/") && path !== "/") path += "/";
    } else {
      if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);
    }

    return path;
  }

  /**
   * Convertit un chemin en regex avec gestion améliorée des paramètres
   */
  pathToRegex(path) {
    const segments = path
      .split("/")
      .filter(Boolean)
      .map((segment) => {
        if (segment.startsWith(":")) {
          const paramName = segment.slice(1);
          // Gestion des paramètres optionnels (suffixe ?)
          if (paramName.endsWith("?")) {
            return `(?:/([^/]+))?`;
          }
          return "([^/]+)";
        }
        return this.config.sensitive ? segment : segment.toLowerCase();
      });

    const regexStr =
      segments.length === 0
        ? "^/$"
        : `^/${segments.join("/")}${this.config.strict ? "" : "/?"}$`;

    return new RegExp(regexStr, this.config.sensitive ? "" : "i");
  }

  /**
   * Extrait les noms des paramètres dynamiques avec support des optionnels
   */
  extractParams(path) {
    return path
      .split("/")
      .filter((segment) => segment.startsWith(":"))
      .map((segment) => {
        const param = segment.slice(1);
        return param.endsWith("?") ? param.slice(0, -1) : param;
      });
  }

  /* ==================== */
  /* === NAVIGATION === */
  /* ==================== */
  async handleNavigation() {
    const path = this.getCurrentPath();
    const matched = this.matchRoute(path);

    console.log(path);

    if (!matched) return this.handleNotFound();

    const { route, params } = matched;

    // Vérification des guards
    if (!(await this.runGuards(route))) return;

    // Transition vers la nouvelle vue
    await this.transitionTo(route, params);
  }

  async transitionTo(route, params) {
    try {
      // Chargement asynchrone si nécessaire
      if (route._component && !route.component) {
        route.component = (await route._component()).default;
      }

      // Vérification du cache
      const cacheKey = this.getCacheKey(route, params);
      let view = this.cache.get(cacheKey);

      if (!view) {
        // Création de la vue
        view = new route.component(this.app, { params, route });

        // Mise en cache
        if (this.config.cacheSize > 0) {
          this.cache.set(cacheKey, view);
          // Limite la taille du cache
          if (this.cache.size > this.config.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }
        }
      }

      // Middlewares "before"
      await this.runMiddlewares(route, "beforeResolve", view);

      // Gestion du layout
      const LayoutClass = this.getLayout(route.layout);
      const layoutChanged =
        !this.currentLayout || this.currentLayout.constructor !== LayoutClass;

      // Changement de layout si nécessaire
      if (layoutChanged) {
        await this.destroyCurrentLayout();
        this.currentLayout = new LayoutClass(this.app);
        await this.currentLayout.setup();
      }

      // Destruction de l'ancienne vue
      await this.destroyCurrentView();

      // Mise à jour des références
      this.previousRoute = this.currentRoute;
      this.currentRoute = route;
      this.currentView = view;

      // Rendu
      await this.currentLayout.beforeRender?.(view);
      await view.render();
      await this.currentLayout.renderView(view);
      document.title = this.getPageTitle(view, route);

      // Middlewares "after"
      await this.runMiddlewares(route, "afterResolve", view);
      this.handleScroll(route);
    } catch (error) {
      console.error("Routing error:", error);
      this.handleError(error);
    }
  }

  /**
   * Génère une clé de cache unique pour une route et ses paramètres
   */
  getCacheKey(route, params) {
    const paramStr = route.params
      .map((param) => `${param}=${params[param] || ""}`)
      .join("&");
    return `${route.path}?${paramStr}`;
  }

  /* ==================== */
  /* === HELPERS === */
  /* ==================== */
  async destroyCurrentLayout() {
    if (this.currentLayout) {
      await this.currentLayout.beforeDestroy?.();
      this.currentLayout.destroy?.();
      this.currentLayout = null;
    }
  }

  async destroyCurrentView() {
    if (this.currentView) {
      await this.currentView.beforeDestroy?.();
      // Ne détruit pas la vue si elle est en cache
      if (![...this.cache.values()].includes(this.currentView)) {
        this.currentView.destroy?.();
      }
      this.currentView = null;
    }
  }

  matchRoute(path) {
    // Normalisation du chemin demandé
    const normalizedPath = this.normalizePath(path);

    for (const route of this.routes) {
      // Test insensible à la casse si configuré
      const testPath = this.config.sensitive
        ? normalizedPath
        : normalizedPath.toLowerCase();
      const match = testPath.match(route.regex);

      if (match) {
        const params = this.extractRouteParams(route, match);
        return { route, params };
      }
    }
    return null;
  }

  extractRouteParams(route, match) {
    return route.params.reduce((acc, param, index) => {
      // Les paramètres optionnels peuvent être undefined
      if (match[index + 1] !== undefined) {
        acc[param] = match[index + 1];
      }
      return acc;
    }, {});
  }

  async runGuards(route) {
    if (!route.guards) return true;

    for (const Guard of route.guards) {
      const result = await Guard.execute(this.app, route);
      if (!result.granted) {
        this.navigateTo(result.redirect || "/", { replace: true });
        return false;
      }
    }
    return true;
  }

  async runMiddlewares(route, hook, view) {
    if (!route.middlewares) return;

    for (const middleware of route.middlewares) {
      if (typeof middleware[hook] === "function") {
        try {
          await middleware[hook](this.app, route, view);
        } catch (error) {
          console.error(`Middleware ${hook} error:`, error);
          throw error; // Propager l'erreur pour la gestion globale
        }
      }
    }
  }

  handleScroll(route) {
    if (route.meta?.scrollToTop !== false) {
      window.scrollTo(0, 0);
    } else if (this.config.saveScrollPosition && this.previousRoute) {
      const scrollPos = this.previousRoute.meta.scrollPosition || {
        x: 0,
        y: 0,
      };
      window.scrollTo(scrollPos.x, scrollPos.y);
    }
  }

  handleLinkClick(event) {
    const link = event.target.closest("a[href]");
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return;

    if (this.config.mode === "hash" && !href.startsWith("#")) {
      event.preventDefault();
      this.navigateTo(`#${href}`);
      return;
    }

    event.preventDefault();
    this.navigateTo(href);
  }

  navigateTo(path, options = {}) {
    if (path === this.getCurrentPath()) return;

    const normalizedPath = this.normalizePath(path);

    if (this.config.mode === "history") {
      this.history[options.replace ? "replaceState" : "pushState"](
        { key: Date.now() }, // Ajout d'une clé unique pour différencier les états
        "",
        normalizedPath
      );
    } else {
      window.location.hash = normalizedPath;
    }
  }

  normalizePath(path) {
    // Si le chemin est déjà normalisé (évite la récursion)
    if (path === "/") return path;

    // Supprime le hash si en mode history
    if (this.config.mode === "history" && path.startsWith("#")) {
      path = path.slice(1);
    }

    // Gestion des chemins relatifs - NE PAS utiliser getCurrentPath()
    if (!path.startsWith("/")) {
      // Pour les chemins relatifs, on suppose qu'ils sont relatifs à la racine
      path = "/" + path;
    }

    // Suppression des doubles slashes
    path = path.replace(/\/+/g, "/");

    // Gestion du slash final selon la config
    if (this.config.strict) {
      if (!path.endsWith("/") && path !== "/") path += "/";
    } else {
      if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);
    }

    return path;
  }

  handleNotFound() {
    const notFoundRoute = this.routes.find((r) => r.path === "/404");
    if (notFoundRoute) this.navigateTo("/404", { replace: true });
    else console.error("Route not found and no 404 handler");
  }

  handleError(error) {
    const errorRoute = this.routes.find((r) => r.path === "/500");
    if (errorRoute) this.navigateTo("/500", { replace: true });
    else console.error("Unhandled routing error:", error);
  }

  getCurrentPath() {
    let path;

    if (this.config.mode === "hash") {
      path = window.location.hash.slice(1) || "/";
    } else {
      path = window.location.pathname.replace(this.config.root, "") || "/";
    }

    return this.normalizePath(path);
  }

  getPageTitle(view, route) {
    return (
      view.title || route.meta?.title || this.app.config.title || document.title
    );
  }

  start() {
    this.handleNavigation();
  }
}

export default Router;
