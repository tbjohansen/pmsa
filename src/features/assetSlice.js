import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: [],
  assetDetails: "",
  assetHistory: [],
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    addAssets(state, action) {
      state.assets = action.payload;
    },

    addAssetDetails(state, action) {
      state.assetDetails = action.payload;
    },

    addAssetHistory(state, action) {
      state.assetHistory = action.payload;
    },
  },
});

export const { addAssets, addAssetDetails, addAssetHistory } =
  assetSlice.actions;

export const selectAssets = (state) => state.asset.assets;
export const selectAssetsDetails = (state) => state.asset.assetDetails;
export const selectAssetHistory = (state) => state.asset.assetHistory;

export default assetSlice.reducer;
