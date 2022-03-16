import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { MqttOptions, MqttUrl } from "constants/mqtt";

const useMqttClient = () => {
  const [client, setClient] = useState(null);
  useEffect(() => {
    const clientId = "mqtt_js_" + Math.random().toString(16).substring(2, 8);
    const isOwnPayload = (contents) =>
      Object.prototype.hasOwnProperty.call(contents, "sender_name") &&
      contents.sender_name === clientId;
    const options = {
      ...MqttOptions,
      clientId,
    };

    const client = mqtt.connect(MqttUrl, options);

    client.on("connect", function () {
      console.log("Connected!");
      client.subscribe("astoria/#");
    });

    client.on("message", function (topic, payload) {
      const contents = JSON.parse(payload.toString());
      console.log(isOwnPayload(contents) ? "🦝" : "🤖", topic, contents);
    });
    setClient(client);
    return () => {
      client.end();
    };
  }, []);

  return client;
};

export default useMqttClient;
