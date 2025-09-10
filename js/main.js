import { version } from "../package.json";
import { loadSettings } from "./settings.js";
import { initLog } from "./logs.js";
import { initUI } from "./ui.js";

window.addEventListener("DOMContentLoaded", (event) => {
  loadSettings();
  initLog();
  initUI();
  document.getElementById("info-kit-ui-version").textContent = version;
});
