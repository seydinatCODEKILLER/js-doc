import { NotFoundView } from "../views/error/NotFoundView.js";
import { UnauthorizedView } from "../views/error/UnAuthorizedView.js";

export const errorRoutes = [
  {
    path: "/404",
    component: NotFoundView,
    meta: {
      layout: "error",
      noAuthRequired: true,
      title: "cette page n'existe pas",
    },
  },
  {
    path: "/unauthorized",
    component: UnauthorizedView,
    meta: {
      layout: "error",
      noAuthRequired: true,
      title: "Accès non autorisé",
    },
  },
];
