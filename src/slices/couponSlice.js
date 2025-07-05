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
import {
  verifySocialMediaPost,
  getVerificationStatus,
  submitVerificationProof,
  canClaimCoupon,
  getRequiredPlatforms,
} from '../services/socialMediaVerificationService';

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
  // Social Media Verification States
  verificationStatus: 'idle',
  verificationError: null,
  canClaimStatus: 'idle',
  canClaimError: null,
  requiredPlatforms: [],
  verificationProof: null,
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

// Social Media Verification Actions
export const verifySocialMediaPostAction = createAsyncThunk(
  '/coupon/verify-social-post',
  async (verificationData, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await verifySocialMediaPost(accessToken, verificationData);
    return response;
  },
);

export const getVerificationStatusAction = createAsyncThunk(
  '/coupon/verification-status',
  async (couponId, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await getVerificationStatus(accessToken, couponId);
    return response;
  },
);

export const submitVerificationProofAction = createAsyncThunk(
  '/coupon/submit-verification',
  async (proofData, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await submitVerificationProof(accessToken, proofData);
    return response;
  },
);

export const canClaimCouponAction = createAsyncThunk(
  '/coupon/can-claim',
  async (couponId, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await canClaimCoupon(accessToken, couponId);
    return response;
  },
);

export const getRequiredPlatformsAction = createAsyncThunk(
  '/coupon/required-platforms',
  async (couponId, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await getRequiredPlatforms(accessToken, couponId);
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
      })
      // Social Media Verification Reducers
      .addCase(verifySocialMediaPostAction.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(verifySocialMediaPostAction.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationProof = action.payload;
      })
      .addCase(verifySocialMediaPostAction.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action?.error?.message ?? 'Verification failed';
      })
      .addCase(getVerificationStatusAction.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(getVerificationStatusAction.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationProof = action.payload;
      })
      .addCase(getVerificationStatusAction.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action?.error?.message ?? 'Failed to get verification status';
      })
      .addCase(submitVerificationProofAction.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(submitVerificationProofAction.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationProof = action.payload;
      })
      .addCase(submitVerificationProofAction.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action?.error?.message ?? 'Failed to submit verification proof';
      })
      .addCase(canClaimCouponAction.pending, (state) => {
        state.canClaimStatus = 'loading';
        state.canClaimError = null;
      })
      .addCase(canClaimCouponAction.fulfilled, (state, action) => {
        state.canClaimStatus = 'succeeded';
        state.canClaimResult = action.payload;
      })
      .addCase(canClaimCouponAction.rejected, (state, action) => {
        state.canClaimStatus = 'failed';
        state.canClaimError = action?.error?.message ?? 'Failed to check claim eligibility';
      })
      .addCase(getRequiredPlatformsAction.pending, (state) => {
        state.verificationStatus = 'loading';
        state.verificationError = null;
      })
      .addCase(getRequiredPlatformsAction.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.requiredPlatforms = action.payload?.data || [];
      })
      .addCase(getRequiredPlatformsAction.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action?.error?.message ?? 'Failed to get required platforms';
      });
  },
});

export const { clearCouponView } = merchentSlice.actions;

export default merchentSlice.reducer;
