import { AuthGuard } from "../app/core/guard/AuthGuard.js";
import { ClientGuard } from "../app/core/guard/RoleGuard.js";
import { ClientArticleView } from "../views/client/ClientArticleView.js";

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
];
