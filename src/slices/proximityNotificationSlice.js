import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { proximityNotificationService } from '../services/proximityNotificationService';

// Async thunks
export const registerForProximityNotifications = createAsyncThunk(
  'proximityNotifications/register',
  async ({ token, userLocation, radius = 20 }, { rejectWithValue }) => {
    try {
      const response = await proximityNotificationService.registerForProximityNotifications(
        token,
        userLocation,
        radius
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProximityLocation = createAsyncThunk(
  'proximityNotifications/updateLocation',
  async ({ token, userLocation, radius = 20 }, { rejectWithValue }) => {
    try {
      const response = await proximityNotificationService.updateProximityLocation(
        token,
        userLocation,
        radius
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNearbyCoupons = createAsyncThunk(
  'proximityNotifications/getNearbyCoupons',
  async ({ token, userLocation, radius = 20 }, { rejectWithValue }) => {
    try {
      const response = await proximityNotificationService.getNearbyCoupons(
        token,
        userLocation,
        radius
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unregisterFromProximityNotifications = createAsyncThunk(
  'proximityNotifications/unregister',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await proximityNotificationService.unregisterFromProximityNotifications(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkProximityNotificationStatus = createAsyncThunk(
  'proximityNotifications/checkStatus',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await proximityNotificationService.checkProximityNotificationStatus(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isRegistered: false,
  isEnabled: false,
  userLocation: null,
  radius: 20,
  nearbyCoupons: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null
};

const proximityNotificationSlice = createSlice({
  name: 'proximityNotifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRadius: (state, action) => {
      state.radius = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    clearNearbyCoupons: (state) => {
      state.nearbyCoupons = [];
    },
    addNearbyCoupon: (state, action) => {
      // Add a new coupon to the nearby coupons list
      const newCoupon = action.payload;
      const existingIndex = state.nearbyCoupons.findIndex(coupon => coupon.id === newCoupon.id);
      
      if (existingIndex === -1) {
        state.nearbyCoupons.unshift(newCoupon); // Add to beginning
      } else {
        state.nearbyCoupons[existingIndex] = newCoupon; // Update existing
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register for proximity notifications
      .addCase(registerForProximityNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerForProximityNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isRegistered = true;
        state.isEnabled = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(registerForProximityNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update proximity location
      .addCase(updateProximityLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProximityLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateProximityLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Get nearby coupons
      .addCase(getNearbyCoupons.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getNearbyCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nearbyCoupons = action.payload.coupons || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getNearbyCoupons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Unregister from proximity notifications
      .addCase(unregisterFromProximityNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(unregisterFromProximityNotifications.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isRegistered = false;
        state.isEnabled = false;
        state.nearbyCoupons = [];
      })
      .addCase(unregisterFromProximityNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Check proximity notification status
      .addCase(checkProximityNotificationStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkProximityNotificationStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isRegistered = action.payload.isRegistered || false;
        state.isEnabled = action.payload.isEnabled || false;
        state.radius = action.payload.radius || 20;
        state.userLocation = action.payload.userLocation || null;
      })
      .addCase(checkProximityNotificationStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setRadius, 
  setUserLocation, 
  clearNearbyCoupons, 
  addNearbyCoupon 
} = proximityNotificationSlice.actions;

export default proximityNotificationSlice.reducer; 