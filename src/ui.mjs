import QRCode from "qrcode";
import {
  broadcast,
  sendMutateRequest,
  sendProcessRequest,
} from "./astoria/request.mjs";
import { clearLog } from "./logs.mjs";

const $serviceProgress = document.getElementById("service-progress");
const $wifiQRCode = document.getElementById("qrcode-wifi");
const $metadataForm = document.getElementById("metadata");
const $metadataLabels = {};

function initModals() {
  // Add a click event on modal triggers
  document.querySelectorAll(".modal-trigger").forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      $target.classList.add("is-active");
    });
  });

  // Add a click event on various child elements to close the parent modal
  document
    .querySelectorAll(
      ".modal-background-close, .modal-close, .modal-card-head .delete, .modal-card-foot .button",
    )
    .forEach(($close) => {
      const $target = $close.closest(".modal");
      if (!$target) return;
      $close.addEventListener("click", () => {
        $target.classList.remove("is-active");
      });
    });
}

function initControls() {
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
}

function initSettingsTabs() {
  document
    .getElementById("settings-tab-strip")
    .querySelectorAll("a")
    .forEach((tab) => {
      const target = tab.dataset.target;
      tab.addEventListener(
        "click",
        (e) => {
          document.querySelectorAll(".settings-tab").forEach((content) => {
            content.classList.add("is-hidden");
          });
          document
            .getElementById(`settings-${target}`)
            .classList.remove("is-hidden");
          document
            .querySelector("#settings-tab-strip li.is-active")
            .classList.remove("is-active");
          tab.parentElement.classList.add("is-active");
        },
        { passive: true },
      );
    });
}

export function initUI() {
  initModals();
  initSettingsTabs();
  initControls();

  document.querySelectorAll("[data-from-metadata]").forEach((el) => {
    $metadataLabels[el.dataset.fromMetadata] = el;
  });
}

export function updateServiceState(connectedServices) {
  const runningServiceCount = Object.values(connectedServices).filter(
    (val) => val,
  ).length;
  if (runningServiceCount === Object.values(connectedServices).length) {
    document.body.classList.add("is-connected");
  } else {
    $serviceProgress.value = runningServiceCount + 1;
  }
}

export function updateMetadataFields(newMetadata) {
  if (newMetadata.wifi_ssid != null && newMetadata.wifi_enabled) {
    document.body.classList.add("has-wifi-enabled");
    QRCode.toCanvas(
      $wifiQRCode,
      `WIFI:T:WPA;S:${newMetadata.wifi_ssid};P:${newMetadata.wifi_psk};;`,
    );
  } else {
    document.body.classList.remove("has-wifi-enabled");
  }

  for (let key in newMetadata) {
    if (key in $metadataForm) {
      $metadataForm[key].value = newMetadata[key];
    } else if (key in $metadataLabels) {
      $metadataLabels[key].textContent = newMetadata[key];
    }
  }
}
