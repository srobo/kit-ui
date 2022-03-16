import React from "react";
import LogTable from "./LogTable";

const LogViewer = ({ client }) => {
  return (
    <React.Fragment>
      <h1>Logs</h1>
      <LogTable client={client} />
    </React.Fragment>
  );
};

export default LogViewer;
