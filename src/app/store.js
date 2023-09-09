import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import userReducer from "../features/userSlice";
import settingSlice from "../features/settingSlice";
import assetReducer from "../features/assetSlice";
import employeeReducer from "../features/employeeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingSlice,
    asset: assetReducer,
    employee: employeeReducer,
  },
  middleware: [thunk]
});