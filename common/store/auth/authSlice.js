import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    userProfileData: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    userProfileData: (state, action) => {
      state.viewMomDetails = action.payload;
    },
  },
});

export const { loginSuccess, logout, userProfileData } = authSlice.actions;

export default authSlice.reducer;
