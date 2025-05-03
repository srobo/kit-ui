import mqtt from "mqtt";
import { disconnected, handleMqttMessage } from "./events.mjs";

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

export function getClient() {
  return client;
}

client.on("connect", function () {
  document.getElementById("serviceProgress").value = 1;
  console.log("Connected!");
  client.subscribe("astoria/#");
  client.subscribe("camera/#");
});

client.on("error", function (err) {
  disconnected();
  console.error(err);
  client.end();
});

client.on("close", disconnected);

client.on("message", handleMqttMessage);
