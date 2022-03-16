import { useEffect } from "react";

const useMqttSubscription = (mqttClient, eventName, handler) => {
  useEffect(() => {
    const wrappedHandler = (topic, payload) => {
      try {
        const contents = JSON.parse(payload.toString());
        if (topic === eventName) {
          handler(contents);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (mqttClient) {
      mqttClient.on("message", wrappedHandler);
    }
    return () => {
      mqttClient?.off("message", wrappedHandler);
    };
  }, [mqttClient, eventName, handler]);
};

export default useMqttSubscription;
