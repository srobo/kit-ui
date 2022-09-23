import { addPlainLogEntry } from "components/LogViewer";
import { MqttRequestTypes, MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export const wrapHandler =
  (handler, dispatch, request, uuid) => (topic, payload) => {
    const { action } = request;

    // We don't get a response from Broadcasts so we don't need to check for it
    const shouldHandle =
      topic == MqttTopics.ProcessRequestIndividual(action, uuid) ||
      topic == MqttTopics.MutateRequestIndividual(uuid);
    if (!shouldHandle) return;

    const contents = JSON.parse(payload.toString());
    if (contents.success) {
      handler(contents);
    } else {
      const requestTypeName =
        action?.charAt(0).toUpperCase() + action?.slice(1);
      const entryText = `💣 ${requestTypeName} failed - ${contents.reason}`;
      dispatch(addPlainLogEntry(entryText));
    }
  };

const getTopicForRequest = (action) => {
  switch (action.type) {
    case MqttRequestTypes.Request:
      return MqttTopics.ProcessRequest(action.action);
    case MqttRequestTypes.Mutate:
      return MqttTopics.MutateRequest;
    case MqttRequestTypes.Broadcast:
      return MqttTopics.EventBroadcast(action.action);
  }
  throw new Error(`Unknown action type: ${action.type}`);
};

const useAstoriaRequest = (client, request, handler) => {
  const [uuid, setUuid] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const wrappedHandler = wrapHandler(handler, dispatch, request, uuid);

    if (client) {
      client.on("message", wrappedHandler);
    }

    return () => {
      client?.off("message", wrappedHandler);
    };
  }, [dispatch, client, handler, request, uuid]);

  return () => {
    const uuid = uuid4();
    const topic = getTopicForRequest(request);
    setUuid(uuid);
    client.publish(
      topic,
      JSON.stringify({
        sender_name: client.options.clientId,
        uuid,
        ...request.payload,
      })
    );
  };
};

export default useAstoriaRequest;
