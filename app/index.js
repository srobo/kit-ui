import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as AppRoutes } from "constants/routes";
import { LogViewer } from "components/LogViewer";
import { useMqttClient } from "modules/mqtt";
import store from "./store";
import { Provider } from "react-redux";

// Get accessibility reports when developing
if (process.env.NODE_ENV !== "production") {
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000);
}

const App = () => {
  const client = useMqttClient();

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            path={AppRoutes.Root}
            element={<LogViewer client={client} />}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
