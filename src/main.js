import mqtt from "mqtt";

const options = {
  keepalive: 30,
  clientId: "mqttjs_" + Math.random().toString(16).substring(2, 8),
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 0,
  connectTimeout: 60 * 1000,
  rejectUnauthorized: false,
};

const client = mqtt.connect(`ws://${location.hostname}:9001`, options);
const logMessageRegex = /\[(\d+:\d{2}:\d{2}\.?\d*)] (.*)/;
let connectedServices = {
  astdiskd: false,
  astmetad: false,
  astprocd: false,
};
let $ = {};
let shouldAutoScroll = true;

window.addEventListener(
  "scroll",
  function (e) {
    shouldAutoScroll =
      window.scrollY + window.innerHeight >= document.body.scrollHeight;
  },
  {
    passive: true,
  }
);

function updateServiceState() {
  const runningServiceCount = Object.values(connectedServices).filter(
    (val) => val
  ).length;
  if (runningServiceCount === Object.values(connectedServices).length) {
    document.body.classList.add("is-connected");
    document.getElementById("modal-disconnected").classList.remove("is-active");
  } else {
    document.getElementById("serviceProgress").value = runningServiceCount + 1;
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  $ = {
    log: document.getElementById("log"),
    templates: {
      logEntry: document.getElementById("tpl-log-entry"),
    },
  };

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
    })
  );

  document.querySelectorAll(".sends-mutate-request").forEach((el) =>
    el.addEventListener("change", function (e) {
      sendMutateRequest(e.target.dataset.property, e.target.value);
    })
  );
});

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
});

const disconnected = function () {
  document.getElementById("serviceProgress").removeAttribute("value");
  document.body.classList.remove("is-connected");
  document.getElementById("modal-disconnected").classList.add("is-active");
  connectedServices = {
    astdiskd: false,
    astmetad: false,
    astprocd: false,
  };
};

client.on("error", function (err) {
  disconnected();
  console.error(err);
  client.end();
});

client.on("close", disconnected);

const handlers = {
  "astoria/broadcast/usercode_log": (contents) => {
    const template = $.templates.logEntry;
    const entryFragment = template.content.cloneNode(true);
    const [_, ts, message] = contents.content.match(logMessageRegex);

    entryFragment.querySelector(".log-entry").dataset.source = contents.source;
    entryFragment.querySelector(".log-entry__ts").textContent = ts;
    const contentEl = entryFragment.querySelector(".log-entry__content");
    contentEl.innerHTML = message.replaceAll(" ", String.fromCharCode(0xa0));

    if (contents.source === "astoria") {
      contentEl.classList.add(
        "has-text-weight-bold",
        "has-text-centered",
        "is-family-sans-serif"
      );
    } else if (contents.source === "stderr") {
      contentEl.classList.add("has-text-danger");
    } else if (message.indexOf("WARNING:") === 0) {
      contentEl.classList.add("has-text-warning");
    }

    $.log.appendChild(entryFragment);
    if (shouldAutoScroll) contentEl.scrollIntoView();
  },
  "astoria/broadcast/start_button": (contents) => {
    createPlainLogEntry("▶️ Start button pressed", "text-d-blue", "text-bold");
  },
  "astoria/astdiskd": (contents) => {
    connectedServices["astdiskd"] = contents.status === "RUNNING";
    updateServiceState();
    document
      .querySelectorAll(".controls button")
      .forEach(
        (el) =>
          (el.disabled =
            Object.values(contents.disks).filter(
              (d) => d.disk_type === "USERCODE"
            ).length === 0)
      );
  },
  "astoria/astmetad": (contents) => {
    connectedServices["astmetad"] = contents.status === "RUNNING";
    updateServiceState();
    document.getElementById("mode_select").value = contents.metadata.mode;
  },
  "astoria/astprocd": (contents) => {
    connectedServices["astprocd"] = contents.status === "RUNNING";
    updateServiceState();
    const statusLabel = status_labels[contents.code_status];
    document.getElementById("status").textContent = statusLabel;
    document.title = `Robot - ${statusLabel}`;
  },
};

const ack = {
  kill: (payload) => {
    createPlainLogEntry("💀 Killed", "text-d-red", "text-bold");
  },
  restart: (payload) => {
    createPlainLogEntry("🔄 Restart", "text-d-blue", "text-bold");
  },
};

client.on("message", function (topic, payload) {
  const contents = JSON.parse(payload.toString());
  console.log(isOwnPayload(contents) ? "🦝" : "🤖", topic, contents);
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

function createPlainLogEntry(text, ...classes) {
  const entry = document.createElement("tr");
  const entryContentElement = document.createElement("td");
  entry.classList.add("plain-log-entry", ...classes);
  entryContentElement.textContent = text;
  entryContentElement.setAttribute("colspan", 2);
  entry.appendChild(entryContentElement);
  $.log.appendChild(entry);
}

function sendProcessRequest(type) {
  const requestUuid = uuid4();
  handlers[`astoria/astprocd/request/${type}/${requestUuid}`] = (payload) => {
    if (payload.success) {
      ack[type](payload);
    } else {
      const requestTypeName = type.charAt(0).toUpperCase() + type.slice(1);
      const entryText = `💣 ${requestTypeName} failed - ${payload.reason}`;
      createPlainLogEntry(entryText, "text-d-red", "text-bold");
    }
    delete handlers[payload.uuid];
  };
  client.publish(
    `astoria/astprocd/request/${type}`,
    JSON.stringify({
      sender_name: options.clientId,
      uuid: requestUuid,
    })
  );
}

function sendMutateRequest(attr, value) {
  const requestUuid = uuid4();
  handlers[`astoria/astmetad/request/mutate/${requestUuid}`] = (payload) => {
    if (!payload.success) {
      createPlainLogEntry(`⚠️ ${payload.reason}`, "text-d-orange", "text-bold");
    }
  };
  client.publish(
    "astoria/astmetad/request/mutate",
    JSON.stringify({
      sender_name: options.clientId,
      uuid: requestUuid,
      attr,
      value,
    })
  );
}

function broadcast(eventName) {
  client.publish(
    `astoria/broadcast/${eventName}`,
    JSON.stringify({
      sender_name: options.clientId,
      event_name: eventName,
      priority: 0,
    })
  );
}

function clearLog() {
  $.log.innerHTML = "";
}
