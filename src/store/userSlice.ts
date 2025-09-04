import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types for the state
interface UserState {
  isLoggedIn: boolean;
  userInfo: any | null; // Consider defining a proper User interface
}

const initialState: UserState = {
  isLoggedIn: true, // change to false
  userInfo: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    setUser(state, action: PayloadAction<any>) {
      state.userInfo = action.payload;
    },
    // New action to reset auth state on logout
    resetAuthState(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
  },
});

export const {
  setIsLoggedIn,
  setUser,
  resetAuthState,
} = userSlice.actions;

export default userSlice.reducer;