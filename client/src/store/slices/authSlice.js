import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import { connectSocket } from "../../lib/socket";

export const getUser = createAsyncThunk("user/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/me");
    connectSocket(res.data.user);
    return res.data.user;
  } catch (error) {
    console.log("Error fetching user:", error);
    return thunkAPI.rejectWithValue(
      error.response?.data || "Failed to fetch user"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    usUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: []
  },
  reducers: {
    serOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.authUser = action.payload;
        isCheckingAuth = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.authUser = null;
        isCheckingAuth = false;
      });
  }
});

export const { serOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
