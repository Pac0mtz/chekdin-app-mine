import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit';
import {
  LoginService as loginAPI,
  SignUpService,
  fetchProfile,
  updateProfile,
  forgotService,
  changePasswordService,
  socialLoginService,
  verifyEmail,
  pushNotification,
  deleteAccountAPI,
} from '../services/authService';
import SessionManager from '../utils/sessionManager';

const initialState = {
  user: null,
  status: 'idle',
  forgotStatus: 'idle',
  loginStatus: 'idle',
  changePasswordStatus: 'idle',
  error: null,
  profileUpdateStatus: 'idle',
  signupStatus: 'idle',
  verifyStatus: 'idle',
  isFromSignup: 'idle',
};

// Create an action creator for setting the FCM result

export const login = createAsyncThunk(
  '/auth/login',
  async (data, {getState, dispatch}) => {
    const response = await loginAPI(data);
    // Save session after successful login
    await SessionManager.saveSession(response);
    dispatch(saveUser(response));
    return response;
  },
);

export const pushNoti = createAsyncThunk(
  '/misc/send-message',
  async (data, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await pushNotification(accessToken, data);
    return response;
  },
);

export const socialLogin = createAsyncThunk(
  '/auth/social-login',
  async (data, {getState}) => {
    console.warn('data socialLogin', data);
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    console.warn('accessToken', accessToken);
    const response = await socialLoginService(data);
    return response;
  },
);

export const forgotPassword = createAsyncThunk(
  '/auth/forget-password',
  async (data, {rejectWithValue}) => {
    console.warn('data fro forgot', data);
    const response = await forgotService(data);
    return response;
  },
);

export const changePassword = createAsyncThunk(
  '/auth/change-password',
  async (data, {getState}) => {
    const response = await changePasswordService(data);
    return response;
  },
);

export const signUp = createAsyncThunk('/auth/customer-signup', async data => {
  const response = await SignUpService(data);
  console.warn('response', response, data);
  return response?.data;
});

export const emailVerify = createAsyncThunk(
  '/auth/verify-email',
  async (data, {rejectWithValue}) => {
    const response = await verifyEmail(data);
    return response;
  },
);

export const getProfile = createAsyncThunk(
  '/auth/profile',
  async (_, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchProfile(accessToken);
    return response;
  },
);

export const deleteAccount = createAsyncThunk(
  '/auth/delete-account',
  async (_, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await deleteAccountAPI(accessToken);
    return response;
  },
);
export const clearChangePasswordStatus = createAsyncThunk(
  '/auth/clear-change-password-status',
  async (_, {getState}) => {
    // No async logic needed here, just return a value
    return null;
  },
);

export const profileUpdate = createAsyncThunk(
  '/profile',
  async (data, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await updateProfile(accessToken, data);
    return response;
  },
);

export const clearUser = createAsyncThunk(
  '/auth/clearUser',
  async (_, {dispatch}) => {
    dispatch(authSlice.actions.clearUserData());
  },
);

export const setFCMResult = createAsyncThunk(
  '/auth/clearUser',
  async (res, {dispatch}) => {
    dispatch(authSlice.actions.fcmResult(res));
  },
);
export const saveUser = createAction('auth/saveUser');

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUserData: state => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    fcmResult: (state, action) => {
      state.fcmResult = action.payload;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.user = state.loginStatus === 'succeeded' && action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(deleteAccount.pending, state => {
        state.deleteAccountStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.deleteAccountStatus = 'succeeded';
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteAccountStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(pushNoti.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(pushNoti.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(pushNoti.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(socialLogin.pending, state => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.user = action.payload;
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(forgotPassword.pending, state => {
        state.forgotStatus = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotStatus = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(changePassword.pending, state => {
        state.changePasswordStatus = 'failed';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordStatus = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(clearChangePasswordStatus.fulfilled, (state, action) => {
        state.changePasswordStatus = 'idle';
        // state.error = null;
      })
      .addCase(saveUser, (state, action) => {
        state.user = action.payload; // Update user data in state
      })
      .addCase(signUp.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUp.fulfilled, state => {
        state.status = 'succeeded';
        state.signupStatus = 'succeeded';
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.signupStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(emailVerify.pending, state => {
        state.verifyStatus = 'loading';
        state.error = null;
      })
      .addCase(emailVerify.fulfilled, (state, action) => {
        state.verifyStatus = 'succeeded';
        state.isFromSignup = 'true';
        state.user = action.payload;
      })
      .addCase(emailVerify.rejected, (state, action) => {
        state.verifyStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(getProfile.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(profileUpdate.pending, state => {
        state.profileUpdateStatus = 'loading';
        state.error = null;
      })
      .addCase(profileUpdate.fulfilled, (state, action) => {
        state.profileUpdateStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(profileUpdate.rejected, (state, action) => {
        state.profileUpdateStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      });
  },
});

export default authSlice.reducer;
