export const ClientActifGuard = {
  execute: async (app) => {
    const state = app.store.getState();

    if (state.role !== "client") {
      return { redirect: "/unauthorized" };
    }

    if (state.user?.deleted === true) {
      app.services.notifications.show("Votre compte est désactivé", "error");
      app.getController("Auth").clearSession();
      return { redirect: "/unauthorized" };
    }

    return { granted: true };
  },
};
