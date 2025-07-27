import { AuthGuard } from "../app/core/guard/AuthGuard.js";
import { ClientGuard } from "../app/core/guard/RoleGuard.js";
import { ClientArticleView } from "../views/client/ClientArticleView.js";
import { ClientDetteView } from "../views/client/ClientDetteView.js";

export const clientRoutes = [
  {
    path: "/client/boutique",
    component: ClientArticleView,
    meta: {
      layout: "client",
      requiresAuth: true,
      requiredRole: "client",
      title: "Gestion des produits",
    },
    guards: [AuthGuard, ClientGuard],
  },
  {
    path: "/client/dette",
    component: ClientDetteView,
    meta: {
      layout: "client",
      requiresAuth: true,
      requiredRole: "client",
      title: "Mes dettes",
    },
    guards: [AuthGuard, ClientGuard],
  },
];
