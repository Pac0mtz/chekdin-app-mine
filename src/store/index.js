import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import merchentReducer from '../slices/merchentSlice';
import couponReducer from '../slices/couponSlice';
import toastReducer from '../slices/toastSlice';
import proximityNotificationReducer from '../slices/proximityNotificationSlice';
import mandatoryProfileReducer from '../slices/mandatoryProfileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    merchent: merchentReducer,
    coupon: couponReducer,
    toast: toastReducer,
    proximityNotifications: proximityNotificationReducer,
    mandatoryProfile: mandatoryProfileReducer,
  },
});

export default store;
