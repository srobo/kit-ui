import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as AppRoutes } from "constants/routes";
import { LogViewer } from "components/LogViewer";
import { useMqttClient } from "modules/mqtt";

const App = () => {
  const client = useMqttClient();

  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoutes.Root} element={<LogViewer client={client} />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
