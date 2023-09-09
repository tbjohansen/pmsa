import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    userDetails: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    addUsers(state, action) {
      state.users = action.payload;
    },

    addUserDetails(state, action) {
      state.userDetails = action.payload;
    },

  },
});

export const { addUsers, addUserDetails} = userSlice.actions;


export const selectUsers = (state) => state.user.users;
export const selectUserDetails = (state) => state.user.userDetails;

export default userSlice.reducer;