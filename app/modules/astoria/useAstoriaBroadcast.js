import { MqttTopics } from "constants/astoria";

const useAstoriaBroadcast = (
  mqttClient,
  eventType,
  options = { priority: 0 }
) => {
  return () => {
    mqttClient.publish(
      MqttTopics.EventBroadcast(eventType),
      JSON.stringify({
        sender_name: mqttClient.options.clientId,
        event_name: eventType,
        priority: options.priority,
      })
    );
  };
};

export default useAstoriaBroadcast;
