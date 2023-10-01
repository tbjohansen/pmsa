import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payrollList: [],
  salaryDetails: "",
  salaries: [],
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    addPayroll(state, action) {
      state.payrollList = action.payload;
    },

    addSalaryDetails(state, action) {
      state.salaryDetails = action.payload;
    },

    addSalaries(state, action) {
      state.salaries = action.payload;
    },
  },
});

export const { addPayroll, addSalaryDetails, addSalaries } =
payrollSlice.actions;

export const selectPayroll = (state) => state.payroll.payrollList;
export const selectSalaryDetails = (state) => state.payroll.salaryDetails;
export const selectSalaries = (state) => state.payroll.salaries;

export default payrollSlice.reducer;
