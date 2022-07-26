import React from "react";
import { wrapProcessRequestHandler } from "modules/astoria";
import { MqttRequestTypes, MqttTopics } from "constants/astoria";
import { uuid4 } from "modules/utils";
import { useDispatch } from "react-redux";

const generateHandler = (request, uuid, actions, uuids, client, dispatch) => {
  const nextRequest = actions.shift();
  const nextUuid = uuids.shift();
  const handler = wrapProcessRequestHandler(
    () => {
      if (nextRequest) {
        const nextHandler = generateHandler(
          nextRequest,
          nextUuid,
          actions,
          uuids,
          client,
          dispatch
        );
        client.on("message", nextHandler);
      }

      if (request) {
        const topic =
          request.type == MqttRequestTypes.Request
            ? MqttTopics.ProcessRequest(request.action)
            : MqttTopics.EventBroadcast(request.action);
        client.publish(
          topic,
          JSON.stringify({
            sender_name: client.options.clientId,
            uuid,
            ...request.payload,
          })
        );
      }

      // Clear the handler after we've run
      client.off("message", handler);
    },
    dispatch,
    request,
    uuid
  );
  request = nextRequest;
  uuid = nextUuid;
  return handler;
};

const MultiRequestButton = ({ requests, client, content }) => {
  const dispatch = useDispatch();
  const onClick = () => {
    const uuids = requests.map(() => uuid4());
    const firstRequest = requests.shift();
    const firstUuid = uuids.shift();

    const initialHandler = generateHandler(
      firstRequest,
      firstUuid,
      requests,
      uuids,
      client,
      dispatch
    );
    const topic =
      firstRequest.type == MqttRequestTypes.Request
        ? MqttTopics.ProcessRequest(firstRequest.action)
        : MqttTopics.EventBroadcast(firstRequest.action);
    client.publish(
      topic,
      JSON.stringify({
        sender_name: client.options.clientId,
        uuid: firstUuid,
        ...firstRequest.payload,
      })
    );
    client.on("message", initialHandler);
  };
  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export default MultiRequestButton;
