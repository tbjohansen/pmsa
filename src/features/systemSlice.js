import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  systemApp: {},
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {

    addSystemApp(state, action) {
      state.systemApp = action.systemApp;
    },

  },
});

export const {addSystemApp} = systemSlice.actions;

export const selectSystemApp = (state) => state.system.systemApp;

export default systemSlice.reducer;
