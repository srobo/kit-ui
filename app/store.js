import { configureStore } from "@reduxjs/toolkit";
import { logsReducer } from "components/LogViewer";

export default configureStore({
  reducer: {
    logs: logsReducer,
  },
});
