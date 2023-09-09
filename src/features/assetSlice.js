import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    assets: [],
    assetDetails: "",
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

  },
});

export const { addAssets, addAssetDetails} = assetSlice.actions;


export const selectAssets = (state) => state.asset.assets;
export const selectAssetsDetails = (state) => state.asset.assetDetails;

export default assetSlice.reducer;