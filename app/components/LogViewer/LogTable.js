import React from "react";
import { MqttTopics, LogMessageRegex } from "constants/astoria";
import { useMqttSubscription } from "modules/mqtt";
import { ControlButton } from "components/Shared";

const LogTable = ({ client }) => {
  const [logs, setLogs] = React.useState([]);
  useMqttSubscription(client, MqttTopics.UserCodeLog, (contents) => {
    setLogs((oldLogs) => [...oldLogs, contents.content]);
  });

  return (
    <React.Fragment>
      <div>
        <ControlButton client={client} action="kill" content="Kill" />
      </div>
      <table>
        <tbody>
          {logs.map((log, index) => (
            <LogEntry key={index} log={log} />
          ))}
        </tbody>
      </table>
    </React.Fragment>
  );
};

const LogEntry = ({ log }) => {
  const [_, ts, message] = log.match(LogMessageRegex);
  return (
    <tr>
      <td>
        <time dateTime={ts}>{ts}</time>
      </td>
      <td>{message}</td>
    </tr>
  );
};

export default LogTable;
