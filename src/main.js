import './style.css'
import { App } from "./app/App.js";
// import { cloudinaryConfig } from './utils/cloudinary.js';

const config = {
  apiBaseUrl: "http://localhost:3000",
  initialState: {
    user: null,
    isAuthenticated: false,
    role: null,
  },
  cloudinary: {
    cloudName: "dvzo0zlpg",
    uploadPreset: "fil-rouge",
    folder: "image",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const app = new App(config);
  window.app = app;

  console.log("Application initialisée", window.app);
});

