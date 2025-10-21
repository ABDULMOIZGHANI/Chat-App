import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios.js";
import { connectSocket, disconnectSocket } from "../../lib/socket.js";
import { toast } from "react-toastify";

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

export const logout = createAsyncThunk("user/signout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/user/signout");
    disconnectSocket();
    return null;
  } catch (error) {
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const login = createAsyncThunk("user/signin", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/user/signin", data); // ✅ FIXED
    connectSocket(res.data.user);
    toast.success("Account loggedin successfully");
    return res.data.user; // ✅ Return user data
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const signup = createAsyncThunk(
  "user/signup",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/user/signup", data);
      connectSocket(res.data.user);
      toast.success("Account created successfully");
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Account Created failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

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
        state.isCheckingAuth = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.authUser = state.authUser;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      });
  }
});

export const { serOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
