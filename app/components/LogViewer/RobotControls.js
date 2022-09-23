import React from "react";
import { MqttRequestTypes } from "constants/astoria";
import { RequestButton, MultiRequestButton } from "components/Shared";

const RobotControls = ({ client }) => (
  <React.Fragment>
    <RequestButton
      client={client}
      request={{ action: "kill", type: MqttRequestTypes.Broadcast }}
      content="Kill"
    />
    <RequestButton
      client={client}
      request={{ action: "start", type: MqttRequestTypes.Broadcast }}
      content="Start"
    />
    <MultiRequestButton
      client={client}
      requests={[
        { action: "kill", type: MqttRequestTypes.Request },
        { action: "restart", type: MqttRequestTypes.Request },
        { action: "start", type: MqttRequestTypes.Broadcast },
      ]}
      content="Restart"
    />
  </React.Fragment>
);

export default RobotControls;
