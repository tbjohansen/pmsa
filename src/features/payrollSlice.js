import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payrollList: [],
  salaryDetails: "",
  salaries: [],
  allPayrolls: [],
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    addPayroll(state, action) {
      state.payrollList = action.payload;
    },

    addAllPayrolls(state, action) {
      state.allPayrolls = action.payload;
    },

    addSalaryDetails(state, action) {
      state.salaryDetails = action.payload;
    },

    addSalaries(state, action) {
      state.salaries = action.payload;
    },
  },
});

export const { addPayroll, addAllPayrolls, addSalaryDetails, addSalaries } =
  payrollSlice.actions;

export const selectPayroll = (state) => state.payroll.payrollList;
export const selectAllPayrolls = (state) => state.payroll.allPayrolls;
export const selectSalaryDetails = (state) => state.payroll.salaryDetails;
export const selectSalaries = (state) => state.payroll.salaries;

export default payrollSlice.reducer;
