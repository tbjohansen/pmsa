import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  designations: [],
  assetTypes: [],
  roles: [],
};

const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {

    addDesignations(state, action) {
      state.designations = action.payload;
    },

    addAssetTypes(state, action) {
      state.assetTypes = action.payload;
    },

    addRoles(state, action) {
      state.roles = action.payload;
    },

  },
});

export const { addDesignations, addAssetTypes, addRoles} = settingSlice.actions;


export const selectDesignations = (state) => state.settings.designations;
export const selectAssetTypes = (state) => state.settings.assetTypes;
export const selectRoles = (state) => state.settings.roles;

export default settingSlice.reducer;
