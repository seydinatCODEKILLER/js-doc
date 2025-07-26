export const BoutiquierActifGuard = {
  execute: async (app) => {
    const state = app.store.getState();

    if (state.role !== "boutiquier") {
      return { redirect: "/unauthorized" };
    }

    if (state.user?.deleted === true) {
      app.services.notifications.show("Votre compte est désactivé", "error");
      return { redirect: "/unauthorized" };
    }

    return { granted: true };
  },
};
