import { createPlainLogEntry } from "../logs.js";
import { ack, registerHandler, unregisterHandler } from "./events.js";
import { getClient } from "./connection.js";

const client = getClient();

export function sendProcessRequest(type) {
  const requestUuid = uuid4();
  const topic = `astoria/astprocd/request/${type}/${requestUuid}`;
  registerHandler(topic, (payload) => {
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
    unregisterHandler(topic);
  });
  client.publish(
    `astoria/astprocd/request/${type}`,
    JSON.stringify({
      sender_name: client.options.clientId,
      uuid: requestUuid,
    }),
  );
}

export function sendMutateRequest(attr, value) {
  const requestUuid = uuid4();
  registerHandler(
    `astoria/astmetad/request/mutate/${requestUuid}`,
    (payload) => {
      if (!payload.success) {
        createPlainLogEntry(
          payload.reason,
          "warning",
          "has-text-warning",
          "text-d-orange",
          "text-bold",
        );
      }
    },
  );
  client.publish(
    "astoria/astmetad/request/mutate",
    JSON.stringify({
      sender_name: client.options.clientId,
      uuid: requestUuid,
      attr,
      value,
    }),
  );
}

export function broadcast(eventName) {
  client.publish(
    `astoria/broadcast/${eventName}`,
    JSON.stringify({
      sender_name: client.options.clientId,
      event_name: eventName,
      priority: 0,
    }),
  );
}

function uuid4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
