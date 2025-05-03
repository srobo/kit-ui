import QRCode from "qrcode";

const $disconnectedModal = document.getElementById("modal-disconnected");
const $wifiQRCode = document.getElementById("qrcode-wifi");

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

function initSettingsTabs() {
  document.getElementById('settings-tab-strip').querySelectorAll('a').forEach((tab) => {
    const target = tab.dataset.target;
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.settings-tab').forEach((content) => {
        content.classList.add('is-hidden');
      });
      document.getElementById(`settings-${target}`).classList.remove('is-hidden');
      document.querySelector('#settings-tab-strip li.is-active').classList.remove('is-active');
      tab.parentElement.classList.add('is-active');
    }, { passive: true });
  });
}

export function initUI() {
  initModals();
  initSettingsTabs();
}

export function updateServiceState(connectedServices) {
  const runningServiceCount = Object.values(connectedServices).filter(
    (val) => val,
  ).length;
  if (runningServiceCount === Object.values(connectedServices).length) {
    document.body.classList.add("is-connected");
    $disconnectedModal.classList.remove("is-active");
  } else {
    document.getElementById("serviceProgress").value = runningServiceCount + 1;
  }
}

export function updateInformationModal(metadata) {
  let ssid, psk;
  if (metadata.wifi_ssid != null && metadata.wifi_enabled) {
    ssid = metadata.wifi_ssid;
    psk = metadata.wifi_psk;
    QRCode.toCanvas($wifiQRCode, `WIFI:T:WPA;S:${ssid};P:${psk};;`);
  } else {
    ssid = "Disabled";
    psk = "Disabled";
    $wifiQRCode
      .getContext("2d")
      .clearRect(0, 0, $wifiQRCode.width, $wifiQRCode.height);
  }
  document.getElementById("info-os-version").textContent =
    metadata.os_pretty_name;
  document.getElementById("info-python-version").textContent =
    metadata.python_version;
  document.getElementById("info-entrypoint").textContent =
    metadata.usercode_entrypoint;
  document.getElementById("info-wifi-ssid").textContent = ssid;
  document.getElementById("info-wifi-secret").textContent = psk;
  const metadataSettings = document.getElementById("metadata");
  metadataSettings["zone"].value = metadata.zone;
  metadataSettings["mode"].value = metadata.mode;
}
