import { version } from "../package.json";
import { loadSettings } from "./settings";
import { initLog } from "./logs.mjs";
import { initUI } from "./ui.mjs";

window.addEventListener("DOMContentLoaded", (event) => {
  loadSettings();
  initLog();
  initUI();
  document.getElementById("info-kit-ui-version").textContent = version;
});
