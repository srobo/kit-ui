import { createPlainLogEntry, createUsercodeLogEntry } from "../logs.mjs";
import { getClient } from "./connection.js";
import { updateMetadataFields, updateServiceState } from "../ui.mjs";

const $lastAnnotatedImage = document.getElementById("last-annotated-image");
const $noAnnotatedImageInstructions = document.getElementById(
  "no-annotated-image-instructions",
);
const $serviceProgress = document.getElementById("service-progress");

const status_labels = {
  code_crashed: "Crashed",
  code_finished: "Finished",
  code_killed: "Killed",
  code_running: "Running",
  code_starting: "Starting",
};

const isOwnPayload = (contents) =>
  contents.hasOwnProperty("sender_name") &&
  contents.sender_name === getClient().options.clientId;

export const ack = {
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

let connectedServices = {
  astdiskd: false,
  astmetad: false,
  astprocd: false,
};

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

    updateServiceState(connectedServices);
  },
  "astoria/astmetad": (contents) => {
    connectedServices["astmetad"] = contents.status === "RUNNING";
    if (!connectedServices["astmetad"]) disconnected(false);

    updateServiceState(connectedServices);
    updateMetadataFields(contents.metadata);
  },
  "astoria/astprocd": (contents) => {
    connectedServices["astprocd"] = contents.status === "RUNNING";
    if (!connectedServices["astprocd"]) disconnected(false);

    updateServiceState(connectedServices);
    const statusLabel = status_labels[contents.code_status];
    document.getElementById("status").textContent = statusLabel;
    document.title = `Robot - ${statusLabel || "Ready"}`;
  },
  "camera/annotated": (contents) => {
    $noAnnotatedImageInstructions.style.display = "none";
    $lastAnnotatedImage.src = contents.data;
  },
};

export function disconnected(reset = true) {
  document.title = "Robot";
  $serviceProgress.removeAttribute("value");
  document.body.classList.remove("is-connected");

  // Reset the state of all services if needed.
  if (reset) {
    connectedServices = {
      astdiskd: false,
      astmetad: false,
      astprocd: false,
    };
  }
}

export function registerHandler(topic, handler) {
  if (handlers[topic]) {
    console.warn(`Handler for ${topic} already registered`);
  }
  handlers[topic] = handler;
}

export function unregisterHandler(topic) {
  if (!handlers[topic]) {
    console.warn(`Handler for ${topic} not registered`);
  }
  delete handlers[topic];
}

export function handleMqttMessage(topic, payload) {
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
}
