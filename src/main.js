import mqtt from "mqtt";
import QRCode from "qrcode";
import { version } from "../package.json";
import { initSettingsTabs, loadSettings } from "./settings";
import { createPlainLogEntry, createUsercodeLogEntry, initLog } from "./logs.mjs";

const options = {
  keepalive: 30,
  clientId: "mqttjs_" + Math.random().toString(16).substring(2, 8),
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  connectTimeout: 60 * 1000,
  rejectUnauthorized: false,
};

const brokerHost = localStorage.getItem("brokerHost") ?? location.hostname;
const client = mqtt.connect(`ws://${brokerHost}:9001`, options);
let connectedServices = {
  astdiskd: false,
  astmetad: false,
  astprocd: false,
};
let $ = {};

function updateServiceState() {
  const runningServiceCount = Object.values(connectedServices).filter(
    (val) => val,
  ).length;
  if (runningServiceCount === Object.values(connectedServices).length) {
    document.body.classList.add("is-connected");
    $.modals.disconnected.classList.remove("is-active");
  } else {
    document.getElementById("serviceProgress").value = runningServiceCount + 1;
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  $ = {
    wifiQRCode: document.getElementById("qrcode-wifi"),
    modals: {
      disconnected: document.getElementById("modal-disconnected"),
      info: document.getElementById("modal-info"),
    },
    lastAnnotatedImage: document.getElementById("last-annotated-image"),
    noAnnotatedImageInstructions: document.getElementById(
      "no-annotated-image-instructions",
    ),
  };

  initSettingsTabs();
  loadSettings();
  initLog();

  document.getElementById("info-kit-ui-version").textContent = version;

  /// Modals
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

function updateInformationModal(metadata) {
  let ssid, psk;
  if (metadata.wifi_ssid != null && metadata.wifi_enabled) {
    ssid = metadata.wifi_ssid;
    psk = metadata.wifi_psk;
    QRCode.toCanvas($.wifiQRCode, `WIFI:T:WPA;S:${ssid};P:${psk};;`);
  } else {
    ssid = "Disabled";
    psk = "Disabled";
    $.wifiQRCode
      .getContext("2d")
      .clearRect(0, 0, $.wifiQRCode.width, $.wifiQRCode.height);
  }
  document.getElementById("info-os-version").textContent =
    metadata.os_pretty_name;
  document.getElementById("info-python-version").textContent =
    metadata.python_version;
  document.getElementById("info-entrypoint").textContent =
    metadata.usercode_entrypoint;
  document.getElementById("info-wifi-ssid").textContent = ssid;
  document.getElementById("info-wifi-secret").textContent = psk;
}

const status_labels = {
  code_crashed: "Crashed",
  code_finished: "Finished",
  code_killed: "Killed",
  code_running: "Running",
  code_starting: "Starting",
};

client.on("connect", function () {
  document.getElementById("serviceProgress").value = 1;
  console.log("Connected!");
  client.subscribe("astoria/#");
  client.subscribe("camera/#");
});

const disconnected = function (reset = true) {
  document.title = "Robot";
  document.getElementById("serviceProgress").removeAttribute("value");
  document.body.classList.remove("is-connected");
  $.modals.disconnected.classList.add("is-active");

  // Reset the state of all services if needed.
  if (reset) {
    connectedServices = {
      astdiskd: false,
      astmetad: false,
      astprocd: false,
    };
  }
};

client.on("error", function (err) {
  disconnected();
  console.error(err);
  client.end();
});

client.on("close", disconnected);

const handlers = {
  "astoria/broadcast/usercode_log": createUsercodeLogEntry,
  "astoria/broadcast/start_button": (contents) => {
    createPlainLogEntry(
      "Start button pressed",
      "play_arrow",
      "has-text-success",
      "text-d-blue",
      "text-bold",
    );
  },
  "astoria/astdiskd": (contents) => {
    connectedServices["astdiskd"] = contents.status === "RUNNING";
    if (!connectedServices["astdiskd"]) disconnected(false);

    updateServiceState();
  },
  "astoria/astmetad": (contents) => {
    connectedServices["astmetad"] = contents.status === "RUNNING";
    if (!connectedServices["astmetad"]) disconnected(false);

    updateServiceState();
    updateInformationModal(contents.metadata);
    document.getElementById("zone_select").value = contents.metadata.zone;

    document.getElementById(
      `mode-${contents.metadata.mode.toLowerCase()}`,
    ).checked = true;
    document.getElementById(`zone-${contents.metadata.zone}`).checked = true;
  },
  "astoria/astprocd": (contents) => {
    connectedServices["astprocd"] = contents.status === "RUNNING";
    if (!connectedServices["astprocd"]) disconnected(false);

    updateServiceState();
    const statusLabel = status_labels[contents.code_status];
    document.getElementById("status").textContent = statusLabel;
    document.title = `Robot - ${statusLabel || "Ready"}`;
  },
  "camera/annotated": (contents) => {
    $.noAnnotatedImageInstructions.style.display = "none";
    $.lastAnnotatedImage.src = contents.data;
  },
};

const ack = {
  kill: (payload) => {
    createPlainLogEntry(
      "Killed",
      "dangerous",
      "has-text-danger",
      "text-d-red",
      "text-bold",
    );
  },
  restart: (payload) => {
    createPlainLogEntry(
      "Restart",
      "restart_alt",
      "has-text-success",
      "text-d-blue",
      "text-bold",
    );
  },
};

client.on("message", function (topic, payload) {
  let contents = null;
  contents = JSON.parse(payload.toString());
  if (topic.startsWith("astoria/")) {
    console.log(isOwnPayload(contents) ? "🦝" : "🤖", topic, contents);
  } else {
    // Truncate the logged image data
    console.log(
      isOwnPayload(contents) ? "🦝" : "🤖",
      topic,
      payload.toString().substring(0, 100),
    );
  }
  if (topic in handlers) {
    handlers[topic](contents);
  }
});

const isOwnPayload = (contents) =>
  contents.hasOwnProperty("sender_name") &&
  contents.sender_name === options.clientId;

function uuid4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function sendProcessRequest(type) {
  const requestUuid = uuid4();
  handlers[`astoria/astprocd/request/${type}/${requestUuid}`] = (payload) => {
    if (payload.success) {
      ack[type](payload);
    } else {
      const requestTypeName = type.charAt(0).toUpperCase() + type.slice(1);
      const entryText = `${requestTypeName} failed - ${payload.reason}`;
      createPlainLogEntry(
        entryText,
        "error",
        "has-text-danger",
        "text-d-red",
        "text-bold",
      );
    }
    delete handlers[payload.uuid];
  };
  client.publish(
    `astoria/astprocd/request/${type}`,
    JSON.stringify({
      sender_name: options.clientId,
      uuid: requestUuid,
    }),
  );
}

function sendMutateRequest(attr, value) {
  const requestUuid = uuid4();
  handlers[`astoria/astmetad/request/mutate/${requestUuid}`] = (payload) => {
    if (!payload.success) {
      createPlainLogEntry(
        payload.reason,
        "warning",
        "has-text-warning",
        "text-d-orange",
        "text-bold",
      );
    }
  };
  client.publish(
    "astoria/astmetad/request/mutate",
    JSON.stringify({
      sender_name: options.clientId,
      uuid: requestUuid,
      attr,
      value,
    }),
  );
}

function broadcast(eventName) {
  client.publish(
    `astoria/broadcast/${eventName}`,
    JSON.stringify({
      sender_name: options.clientId,
      event_name: eventName,
      priority: 0,
    }),
  );
}

function clearLog() {
  document.querySelectorAll('.log-entry, .plain-log-entry').forEach((el) => {
    el.remove();
  });
}
