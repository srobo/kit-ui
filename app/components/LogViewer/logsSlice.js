import { createSlice } from "@reduxjs/toolkit";
import { LogMessageRegex } from "constants/astoria";

export const logsSlice = createSlice({
  name: "log",
  initialState: {
    logs: [],
  },
  reducers: {
    addUserCodeLogEntry: (state, action) => {
      const [_, ts, message] = action.payload.match(LogMessageRegex);
      state.logs.push({ ts, message });
    },
    addPlainLogEntry: (state, action) => {
      state.logs.push({
        ts: null,
        message: action.payload,
      });
    },
  },
});

export const { addUserCodeLogEntry, addPlainLogEntry } = logsSlice.actions;

export default logsSlice.reducer;
