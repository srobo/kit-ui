import { addPlainLogEntry } from "components/LogViewer";
import { MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useAstoriaMutateRequest = (client, attr, value) => {
  const [uuid, setUuid] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const wrappedHandler = (topic, payload) => {
      if (topic != MqttTopics.MutateRequestIndividual(uuid)) return;
      const contents = JSON.parse(payload.toString());
      if (!contents.success) {
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
  }, [dispatch, client, attr, value, uuid]);

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
