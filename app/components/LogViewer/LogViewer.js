import RobotControls from "./RobotControls";
import React from "react";
import LogTable from "./LogTable";

const LogViewer = ({ client }) => {
  return (
    <main>
      <h1>Logs</h1>
      <RobotControls client={client} />
      <LogTable client={client} />
    </main>
  );
};

export default LogViewer;
