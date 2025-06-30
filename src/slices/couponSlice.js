import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  RedeemCoupon,
  checkCouponView,
  checkdin,
  fetchCouponDetails,
  fetchCouponList,
  fetchCouponStats,
  iSCheckedIn,
  sendCheckinCount,
  sendCheckinRequest,
  checkScanCouponData,
} from '../services/couponservice';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  addRedeemCouponStatus: 'idle',
  checkdinStatus: 'idle',
  addRedeemCouponErr: 'idle',
  checkScanDataStatus: 'idle',
  viewCouponErr: 'idle',
  couponViewStatus: 'idle',
};

export const getCouponList = createAsyncThunk(
  '/coupon/list',
  async (search, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchCouponList(accessToken, search);
    return response;
  },
);

export const checkIsCoupon = createAsyncThunk(
  'coupon/is-chekdin',
  async (couponId, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await iSCheckedIn(accessToken, couponId);
    return response;
  },
);

export const CouponView = createAsyncThunk(
  '/coupon/add-view',
  async (data, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await checkCouponView(accessToken, data);
    return response;
  },
);

export const checkinData = createAsyncThunk(
  '/checkin',
  async (data, {getState}) => {
    console.warn('data checkin', data._parts);
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await sendCheckinRequest(accessToken, data);
    return response;
  },
);
export const checkScanData = createAsyncThunk(
  '/coupon/scan-checkdin-coupon',
  async (data, {getState}) => {
    console.log('calling... sl checkScanData', data);
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await checkScanCouponData(accessToken, data);
    console.warn(response, 'response scaneddd');
    return response;
  },
);
export const checkinCount = createAsyncThunk(
  '/coupon/checkin/count',
  async (data, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await sendCheckinCount(accessToken, data);
    return response;
  },
);

export const getCouponDetails = createAsyncThunk(
  '/coupon/get',
  async (id, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchCouponDetails(id, accessToken);
    return response;
  },
);

export const getCouponStats = createAsyncThunk(
  '/coupon/stats',
  async (latlong, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchCouponStats(latlong, accessToken);
    return response;
  },
);

export const addRedeemCoupon = createAsyncThunk(
  '/coupon/redeem-coupon',
  async (id, {getState}) => {
    console.log('helloo -->', id);

    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await RedeemCoupon(id, accessToken);
    return response;
  },
);

export const merchentSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCouponView: (state) => {
      state.couponView = undefined;
      state.couponViewStatus = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCouponList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.couponList = action.payload;
      })
      .addCase(getCouponList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(getCouponDetails.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkIsCoupon.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.checkIsCoupon = action.payload;
      })
      .addCase(checkIsCoupon.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(checkIsCoupon.pending, state => {
        state.status = 'loading';
        state.error = null;
      })

      .addCase(getCouponDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.couponDetails = action.payload;
      })
      .addCase(getCouponDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(addRedeemCoupon.pending, state => {
        state.addRedeemCouponStatus = 'loading';
        state.addRedeemCouponErr = null;
      })
      .addCase(addRedeemCoupon.fulfilled, (state, action) => {
        state.addRedeemCouponStatus = 'succeeded';
        state.couponDetails = action.payload;
      })
      .addCase(addRedeemCoupon.rejected, (state, action) => {
        state.addRedeemCouponStatus = 'failed';
        state.addRedeemCouponErr =
          action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(getCouponStats.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCouponStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.couponStats = action.payload;
      })
      .addCase(getCouponStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(checkinData.pending, state => {
        state.checkdinStatus = 'loading';
        state.error = null;
      })
      .addCase(checkinData.fulfilled, (state, action) => {
        state.checkdinStatus = 'succeeded';
        state.checkdin = action.payload;
      })
      .addCase(checkinData.rejected, (state, action) => {
        state.checkdinStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(checkinCount.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkinCount.fulfilled, (state, action) => {
        state.couponCount = action.payload;
        state.status = 'succeeded';
      })
      .addCase(checkinCount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(checkScanData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkScanData.fulfilled, (state, action) => {
        console.warn('succeeded', action.payload);
        state.couponScan = action.payload;
        state.status = 'succeeded';
      })
      .addCase(checkScanData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(CouponView.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(CouponView.fulfilled, (state, action) => {
        console.warn('CouponView succeeded', action.payload);
        state.couponView = action.payload;
        state.status = 'succeeded';
        state.couponViewStatus = 'succeeded';
      })
      .addCase(CouponView.rejected, (state, action) => {
        console.warn('CouponView rejected', action.error);
        state.status = 'failed';
        state.couponViewStatus = 'failed';
      });
  },
});

export const { clearCouponView } = merchentSlice.actions;

export default merchentSlice.reducer;
