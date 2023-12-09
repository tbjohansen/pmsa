import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loans: [],
  loanDetails: "",
  loanPayments: [],
  filteredLoans: [],
};

const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    addLoans(state, action) {
      state.loans = action.payload;
    },

    addLoanDetails(state, action) {
      state.loanDetails = action.payload;
    },

    addLoanPayments(state, action) {
      state.loanPayments = action.payload;
    },

    addFilteredLoans(state, action) {
      state.filteredLoans = action.payload;
    },
  },
});

export const { addLoans, addLoanDetails, addLoanPayments, addFilteredLoans } =
loanSlice.actions;

export const selectLoans = (state) => state.loan.loans;
export const selectLoanDetails = (state) => state.loan.loanDetails;
export const selectLoanPayments = (state) => state.loan.loanPayments;
export const selectFilteredLoans = (state) => state.loan.filteredLoans;

export default loanSlice.reducer;
