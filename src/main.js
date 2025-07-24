import './style.css'
import { App } from "./app/App.js";

const config = {
  apiBaseUrl: "http://localhost:3000",
  initialState: {
    user: null,
    isAuthenticated: false,
    role: null,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const app = new App(config);
  window.app = app;

  console.log("Application initialisée", window.app);
});

