import { addPlainLogEntry } from "components/LogViewer";
import { MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useAstoriaProcessRequest = (client, type, handler) => {
  const [uuid, setUuid] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const wrappedHandler = (topic, payload) => {
      if (topic != MqttTopics.ProcessRequestIndividual(type, uuid)) return;
      const contents = JSON.parse(payload.toString());
      if (contents.success) {
        handler(contents);
      } else {
        const requestTypeName = topic.charAt(0).toUpperCase() + topic.slice(1);
        const entryText = `💣 ${requestTypeName} failed - ${payload.reason}`;
        dispatch(addPlainLogEntry(entryText));
      }
    };

    if (client) {
      client.on("message", wrappedHandler);
    }

    return () => {
      client?.off("message", wrappedHandler);
    };
  }, [dispatch, client, handler, type, uuid]);

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
