import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import SMSMarketingService from '../services/smsMarketingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  isProfileComplete: false,
  isModalVisible: false,
  isMandatory: false, // New field to track if modal is mandatory
  loginAttempts: 0, // Track number of login attempts
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastChecked: null,
};

// Async thunk to check if profile is complete
export const checkProfileCompletion = createAsyncThunk(
  'mandatoryProfile/checkCompletion',
  async (userProfile, {getState, rejectWithValue}) => {
    try {
      const isComplete = SMSMarketingService.hasRequiredProfileInfo(userProfile);
      
      if (!isComplete) {
        // Get current login attempts for this user
        const {auth} = getState();
        const userEmail = auth.user?.data?.email;
        
        if (userEmail) {
          const attemptsKey = `profileAttempts_${userEmail}`;
          const currentAttempts = await AsyncStorage.getItem(attemptsKey);
          const attempts = currentAttempts ? parseInt(currentAttempts) : 0;
          const newAttempts = attempts + 1;
          
          // Store updated attempts count
          await AsyncStorage.setItem(attemptsKey, newAttempts.toString());
          
          // Check if this is the 3rd or more attempt
          const isMandatory = newAttempts >= 3;
          
          return {
            isComplete,
            userProfile,
            loginAttempts: newAttempts,
            isMandatory
          };
        }
      }
      
      return {isComplete, userProfile, loginAttempts: 0, isMandatory: false};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to mark profile as complete
export const markProfileComplete = createAsyncThunk(
  'mandatoryProfile/markComplete',
  async (_, {getState, rejectWithValue}) => {
    try {
      const {auth} = getState();
      const userProfile = auth.profile?.data;
      const userEmail = auth.user?.data?.email;
      
      if (!userProfile) {
        throw new Error('No user profile available');
      }
      
      const isComplete = SMSMarketingService.hasRequiredProfileInfo(userProfile);
      
      if (!isComplete) {
        throw new Error('Profile is not complete');
      }
      
      // Reset login attempts when profile is completed
      if (userEmail) {
        const attemptsKey = `profileAttempts_${userEmail}`;
        await AsyncStorage.removeItem(attemptsKey);
      }
      
      return {isComplete: true, userProfile, loginAttempts: 0, isMandatory: false};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to show mandatory profile modal
export const showMandatoryProfileModal = createAsyncThunk(
  'mandatoryProfile/showModal',
  async (_, {getState, rejectWithValue}) => {
    try {
      const {auth} = getState();
      const userProfile = auth.profile?.data;
      const userEmail = auth.user?.data?.email;
      
      if (!userProfile) {
        throw new Error('No user profile available');
      }
      
      const isComplete = SMSMarketingService.hasRequiredProfileInfo(userProfile);
      
      if (!isComplete && userEmail) {
        // Get current attempts
        const attemptsKey = `profileAttempts_${userEmail}`;
        const currentAttempts = await AsyncStorage.getItem(attemptsKey);
        const attempts = currentAttempts ? parseInt(currentAttempts) : 0;
        const isMandatory = attempts >= 3;
        
        return {
          shouldShowModal: true,
          userProfile,
          isComplete,
          loginAttempts: attempts,
          isMandatory
        };
      }
      
      return {
        shouldShowModal: false,
        userProfile,
        isComplete,
        loginAttempts: 0,
        isMandatory: false
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to reset login attempts (for testing)
export const resetLoginAttempts = createAsyncThunk(
  'mandatoryProfile/resetAttempts',
  async (_, {getState, rejectWithValue}) => {
    try {
      const {auth} = getState();
      const userEmail = auth.user?.data?.email;
      
      if (userEmail) {
        const attemptsKey = `profileAttempts_${userEmail}`;
        await AsyncStorage.removeItem(attemptsKey);
        return {loginAttempts: 0, isMandatory: false};
      }
      
      return {loginAttempts: 0, isMandatory: false};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const mandatoryProfileSlice = createSlice({
  name: 'mandatoryProfile',
  initialState,
  reducers: {
    // Show the mandatory profile modal
    showModal: (state, action) => {
      state.isModalVisible = true;
      state.isMandatory = action.payload?.isMandatory || false;
      state.status = 'idle';
      state.error = null;
    },
    
    // Hide the mandatory profile modal
    hideModal: (state) => {
      state.isModalVisible = false;
    },
    
    // Set profile completion status
    setProfileComplete: (state, action) => {
      state.isProfileComplete = action.payload;
      state.lastChecked = new Date().toISOString();
    },
    
    // Set mandatory status
    setMandatory: (state, action) => {
      state.isMandatory = action.payload;
    },
    
    // Set login attempts
    setLoginAttempts: (state, action) => {
      state.loginAttempts = action.payload;
    },
    
    // Reset the state
    reset: (state) => {
      state.isProfileComplete = false;
      state.isModalVisible = false;
      state.isMandatory = false;
      state.loginAttempts = 0;
      state.status = 'idle';
      state.error = null;
      state.lastChecked = null;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkProfileCompletion
      .addCase(checkProfileCompletion.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkProfileCompletion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isProfileComplete = action.payload.isComplete;
        state.loginAttempts = action.payload.loginAttempts;
        state.isMandatory = action.payload.isMandatory;
        state.lastChecked = new Date().toISOString();
        
        // Show modal if profile is not complete
        if (!action.payload.isComplete) {
          state.isModalVisible = true;
        }
      })
      .addCase(checkProfileCompletion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // markProfileComplete
      .addCase(markProfileComplete.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(markProfileComplete.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isProfileComplete = true;
        state.isModalVisible = false;
        state.isMandatory = false;
        state.loginAttempts = 0;
        state.lastChecked = new Date().toISOString();
      })
      .addCase(markProfileComplete.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // showMandatoryProfileModal
      .addCase(showMandatoryProfileModal.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(showMandatoryProfileModal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isProfileComplete = action.payload.isComplete;
        state.isModalVisible = action.payload.shouldShowModal;
        state.loginAttempts = action.payload.loginAttempts;
        state.isMandatory = action.payload.isMandatory;
        state.lastChecked = new Date().toISOString();
      })
      .addCase(showMandatoryProfileModal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // resetLoginAttempts
      .addCase(resetLoginAttempts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetLoginAttempts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loginAttempts = action.payload.loginAttempts;
        state.isMandatory = action.payload.isMandatory;
      })
      .addCase(resetLoginAttempts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  showModal,
  hideModal,
  setProfileComplete,
  setMandatory,
  setLoginAttempts,
  reset,
  setError,
  clearError,
} = mandatoryProfileSlice.actions;

// Selectors
export const selectIsProfileComplete = (state) => state.mandatoryProfile.isProfileComplete;
export const selectIsModalVisible = (state) => state.mandatoryProfile.isModalVisible;
export const selectIsMandatory = (state) => state.mandatoryProfile.isMandatory;
export const selectLoginAttempts = (state) => state.mandatoryProfile.loginAttempts;
export const selectProfileStatus = (state) => state.mandatoryProfile.status;
export const selectProfileError = (state) => state.mandatoryProfile.error;
export const selectLastChecked = (state) => state.mandatoryProfile.lastChecked;

export default mandatoryProfileSlice.reducer; 