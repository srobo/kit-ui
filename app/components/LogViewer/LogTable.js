import React from "react";
import { MqttTopics } from "constants/astoria";
import { useMqttSubscription } from "modules/mqtt";
import { useDispatch, useSelector } from "react-redux";
import { getLogsState } from "./selectors";
import { addUserCodeLogEntry } from "./logsSlice";

const LogTable = ({ client }) => {
  const { logs } = useSelector(getLogsState);
  const dispatch = useDispatch();
  useMqttSubscription(client, MqttTopics.UserCodeLog, (contents) => {
    dispatch(addUserCodeLogEntry(contents.content));
  });

  return (
    <table>
      <tbody>
        {logs.map((log, index) => (
          <LogEntry key={index} log={log} />
        ))}
      </tbody>
    </table>
  );
};

const LogEntry = ({ log: { ts, message } }) => {
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
