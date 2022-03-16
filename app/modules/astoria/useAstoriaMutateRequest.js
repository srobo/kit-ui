import { MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useEffect, useState } from "react";

const useAstoriaMutateRequest = (client, attr, value) => {
  const [uuid, setUuid] = useState(null);
  useEffect(() => {
    const wrappedHandler = (topic, payload) => {
      if (topic != MqttTopics.MutateRequestIndividual(uuid)) return;
      const contents = JSON.parse(payload.toString());
      if (!contents.success) {
        console.error(contents.reason);
        //TODO: Add Error to log table
      }
    };

    if (client) {
      client.on("message", wrappedHandler);
    }

    return () => {
      client?.off("message", wrappedHandler);
    };
  }, [client, attr, value, uuid]);

  return () => {
    const uuid = uuid4();
    setUuid(uuid);
    client.publish(
      MqttTopics.MutateRequest,
      JSON.stringify({
        sender_name: client.options.clientId,
        uuid,
        attr,
        value,
      })
    );
  };
};

export default useAstoriaMutateRequest;
