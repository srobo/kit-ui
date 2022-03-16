import { useAstoriaProcessRequest } from "modules/astoria";
import React from "react";

const ControlButton = ({ action, client, content }) => {
  const onClick = useAstoriaProcessRequest(client, action, (payload) => {
    console.log(`${action} request actioned`, payload);
  });
  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export default ControlButton;
