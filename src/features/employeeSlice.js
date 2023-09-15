import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
  employeeDetails: "",
  employeeAssets: [],
  employeeLoans: [],
  additionalInfo: "",
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    addEmployees(state, action) {
      state.employees = action.payload;
    },

    addEmployeesDetails(state, action) {
      state.employeeDetails = action.payload;
    },

    addEmployeesAssets(state, action) {
      state.employeeAssets = action.payload;
    },

    addEmployeesLoans(state, action) {
      state.employeeLoans = action.payload;
    },

    addAdditionalInfo(state, action) {
      state.additionalInfo = action.payload;
    },
  },
});

export const {
  addEmployees,
  addEmployeesDetails,
  addEmployeesAssets,
  addEmployeesLoans,
  addAdditionalInfo,
} = employeeSlice.actions;

export const selectEmployees = (state) => state.employee.employees;
export const selectEmployeeDetails = (state) => state.employee.employeeDetails;
export const selectEmployeeLoans = (state) => state.employee.employeeLoans;
export const selectEmployeeAssets = (state) => state.employee.employeeAssets;
export const selectAdditionalInfo = (state) => state.employee.additionalInfo;

export default employeeSlice.reducer;
