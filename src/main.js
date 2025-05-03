import { version } from "../package.json";
import { loadSettings } from "./settings";
import { clearLog, initLog } from "./logs.mjs";
import { initUI } from "./ui.mjs";
import { broadcast, sendMutateRequest, sendProcessRequest } from "./astoria/request.mjs";

window.addEventListener("DOMContentLoaded", (event) => {
  loadSettings();
  initLog();
  initUI();

  document.getElementById("info-kit-ui-version").textContent = version;

  /// Buttons
  document.querySelectorAll("[data-action]").forEach((el) =>
    el.addEventListener("click", function (e) {
      e.preventDefault();
      switch (e.target.dataset.action) {
        case "start":
          broadcast("start_button");
          break;
        case "restart":
          sendProcessRequest("restart");
          break;
        case "kill":
          sendProcessRequest("kill");
          break;
        case "clearLog":
          clearLog();
          break;
      }
    }),
  );

  document.querySelectorAll(".sends-mutate-request").forEach((el) =>
    el.addEventListener("change", function (e) {
      sendMutateRequest(e.target.name, e.target.value);
    }),
  );
});
