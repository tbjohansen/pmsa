import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    employees: [],
    employeesDetails: "",
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {

    addEmployees(state, action) {
      state.employees = action.payload;
    },

    addEmployeesDetails(state, action) {
      state.employeesDetails = action.payload;
    },

  },
});

export const { addEmployees, addEmployeesDetails} = employeeSlice.actions;


export const selectEmployees = (state) => state.employee.employees;
export const selectEmployeesDetails = (state) => state.employee.employeeDetails;

export default employeeSlice.reducer;