import { MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useEffect, useState } from "react";

const useAstoriaProcessRequest = (client, type, handler) => {
  const [uuid, setUuid] = useState(null);
  useEffect(() => {
    const wrappedHandler = (topic, payload) => {
      if (topic != MqttTopics.ProcessRequestIndividual(type, uuid)) return;
      const contents = JSON.parse(payload.toString());
      if (contents.success) {
        handler(contents);
      } else {
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
  }, [client, handler, type, uuid]);

  return () => {
    const uuid = uuid4();
    setUuid(uuid);
    client.publish(
      MqttTopics.ProcessRequest(type),
      JSON.stringify({
        sender_name: client.options.clientId,
        uuid,
      })
    );
  };
};

export default useAstoriaProcessRequest;
