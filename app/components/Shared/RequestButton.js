import React from "react";
import { useAstoriaRequest } from "modules/astoria";

const RequestButton = ({ request, client, content }) => {
  const onClick = useAstoriaRequest(client, request, (payload) => {
    console.log(`${request.action} request actioned`, payload);
  });
  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export default RequestButton;
