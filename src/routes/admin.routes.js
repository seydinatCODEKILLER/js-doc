import { AuthGuard } from "../app/core/guard/AuthGuard.js";
import { AdminGuard } from "../app/core/guard/RoleGuard.js";
import { AdminBoutiquierView } from "../views/admin/AdminBoutiquierView.js";
import { AdminDashboardView } from "../views/admin/AdminDashboardView.js";

export const adminRoutes = [
  {
    path: "/admin/dashboard",
    component: AdminDashboardView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      requiredRole: "admin",
      title: "Tableau de bord",
    },
    guards: [AuthGuard, AdminGuard],
  },
  {
    path: "/admin/boutiquiers",
    component: AdminBoutiquierView,
    meta: {
      layout: "admin",
      requiresAuth: true,
      requiredRole: "admin",
      title: "Gestion des boutiquiers",
      // noCache: true,
    },
    guards: [AuthGuard, AdminGuard],
  },
];
