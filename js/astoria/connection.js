import mqtt from "mqtt";
import { disconnected, handleMqttMessage } from "./events.js";

const options = {
  // Keep connection alive for 5 seconds after a disconnect
  keepalive: 5,
  // Once disconnected, wait up to 10 minutes before closing the connection
  connectTimeout: 600 * 1000,
  rejectUnauthorized: false,
};

const brokerHost = localStorage.getItem("brokerHost") ?? location.hostname;
const client = mqtt.connect(`ws://${brokerHost}:9001`, options);

export function getClient() {
  return client;
}

client.on("connect", function () {
  document.getElementById("service-progress").value = 1;
  console.log("Connected!");
  client.subscribe("astoria/#");
  client.subscribe("camera/#");
});

client.on("error", function (err) {
  disconnected();
  console.error(err);
  client.end();
  client.reconnect();
});

client.on("close", disconnected);

client.on("message", handleMqttMessage);
