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
  resendOTP,
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
  resendOTPStatus: 'idle',
  isFromSignup: 'idle',
  justLoggedIn: false,
  justVerifiedSignup: false, // Track when user just completed email verification
  pendingSignupData: null, // Store signup data until email verification
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
  async (data, {getState, dispatch, rejectWithValue}) => {
    try {
      console.log('Social login thunk called with:', data);
      const response = await socialLoginService(data);
      console.log('Social login successful:', response);
      
      // Save session after successful social login
      await SessionManager.saveSession(response);
      dispatch(saveUser(response));
      
      return response;
    } catch (error) {
      console.error('Social login failed:', error);
      return rejectWithValue(error.message);
    }
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
  // Send to Zapier webhook
  try {
    await fetch('https://hooks.zapier.com/hooks/catch/5642269/ubba5lk/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
      }),
    });
  } catch (err) {
    console.warn('Zapier webhook failed', err);
  }
  return response?.data;
});

export const emailVerify = createAsyncThunk(
  '/auth/verify-email',
  async (data, {rejectWithValue}) => {
    try {
      console.log('Email verification thunk called with:', data);
      const response = await verifyEmail(data);
      console.log('Email verification successful:', response);
      return response;
    } catch (error) {
      console.error('Email verification failed:', error);
      return rejectWithValue(error.message);
    }
  },
);

export const resendOTPThunk = createAsyncThunk(
  '/auth/resend-otp',
  async (email, {rejectWithValue}) => {
    try {
      console.log('Resend OTP thunk called with:', email);
      const response = await resendOTP(email);
      console.log('Resend OTP successful:', response);
      return response;
    } catch (error) {
      console.error('Resend OTP failed:', error);
      return rejectWithValue(error.message);
    }
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
  async (data, {getState, rejectWithValue}) => {
    try {
      const {user} = getState().auth;
      const accessToken = user?.data?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available. Please login again.');
      }
      
      console.log('Profile update thunk - access token:', accessToken ? 'Present' : 'Missing');
      console.log('Profile update thunk - data:', data);
      
      const response = await updateProfile(accessToken, data);
      console.log('Profile update thunk - response:', response);
      return response;
    } catch (error) {
      console.error('Profile update thunk error:', error);
      return rejectWithValue({
        message: error.message || 'Profile update failed',
        error: error
      });
    }
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
    resetJustLoggedIn: state => {
      state.justLoggedIn = false;
    },
    resetJustVerifiedSignup: state => {
      state.justVerifiedSignup = false;
    },
    resetAuthState: state => {
      state.user = null;
      state.status = 'idle';
      state.forgotStatus = 'idle';
      state.loginStatus = 'idle';
      state.changePasswordStatus = 'idle';
      state.error = null;
      state.profileUpdateStatus = 'idle';
      state.signupStatus = 'idle';
      state.verifyStatus = 'idle';
      state.resendOTPStatus = 'idle';
      state.isFromSignup = 'idle';
      state.justLoggedIn = false;
      state.justVerifiedSignup = false;
      state.pendingSignupData = null;
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
        state.justLoggedIn = true;
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
        state.justLoggedIn = true;
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
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.signupStatus = 'succeeded';
        // Store signup data temporarily until email verification
        state.pendingSignupData = action.payload;
        // Don't set user yet - wait for email verification
        // state.user = action.payload;
        // state.justLoggedIn = true;
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
        state.justLoggedIn = true; // Set justLoggedIn only after email verification
        state.justVerifiedSignup = true;
        state.error = null;
        // Clear pending signup data after successful verification
        state.pendingSignupData = null;
        // Save session only after successful verification
        if (action.payload) {
          // Save session to AsyncStorage
          require('../utils/sessionManager').default.saveSession(action.payload);
        }
      })
      .addCase(emailVerify.rejected, (state, action) => {
        state.verifyStatus = 'failed';
        state.error = action?.payload ?? action?.error?.message ?? 'Verification failed. Please try again.';
      })
      .addCase(resendOTPThunk.pending, state => {
        state.resendOTPStatus = 'loading';
        state.error = null;
      })
      .addCase(resendOTPThunk.fulfilled, (state, action) => {
        state.resendOTPStatus = 'succeeded';
        state.error = null;
      })
      .addCase(resendOTPThunk.rejected, (state, action) => {
        state.resendOTPStatus = 'failed';
        state.error = action?.payload ?? action?.error?.message ?? 'Failed to resend OTP. Please try again.';
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
        state.error = action?.payload?.message ?? action?.error?.message ?? 'Profile update failed. Please try again.';
        console.error('Profile update rejected:', action.payload || action.error);
      })
      .addCase(resetAuthState.fulfilled, (state) => {
        // State is already reset in the reducer
      });
  },
});

export const { resetJustLoggedIn, resetJustVerifiedSignup } = authSlice.actions;

export const resetAuthState = createAsyncThunk(
  '/auth/reset-state',
  async (_, {dispatch}) => {
    dispatch(authSlice.actions.resetAuthState());
  },
);

export default authSlice.reducer;
