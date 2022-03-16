import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as AppRoutes } from "constants/routes";
import { LogViewer } from "components/LogViewer";
import { useMqttClient } from "modules/mqtt";
import store from "./store";
import { Provider } from "react-redux";

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

ReactDOM.render(<App />, document.getElementById("root"));
