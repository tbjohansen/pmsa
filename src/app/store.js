import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import userReducer from "../features/userSlice";
import settingSlice from "../features/settingSlice";
import assetReducer from "../features/assetSlice";
import employeeReducer from "../features/employeeSlice";
import loanReducer from "../features/loanSlice";
import payrollReducer from "../features/payrollSlice";
import systemReducer from "../features/systemSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingSlice,
    asset: assetReducer,
    employee: employeeReducer,
    loan: loanReducer,
    payroll: payrollReducer,
    system: systemReducer,
  },
  middleware: [thunk]
});