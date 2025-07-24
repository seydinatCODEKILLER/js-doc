import { AuthView } from "../views/auth/AuthView.js";

export const authRoutes = [
  {
    path: "/",
    component: AuthView,
    meta: {
      layout: "auth",
      noAuthRequired: true,
      title: "Connexion",
    },
  },
  {
    path: "/login",
    component: AuthView,
    meta: {
      layout: "auth",
      noAuthRequired: true,
      title: "Connexion",
    },
  },
];
