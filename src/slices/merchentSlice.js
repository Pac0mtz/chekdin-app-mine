import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit';
import {
  fetchMerchantDetails,
  fetchMerchantList,
  filterMerchantList,
} from '../services/merchantService';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
};

export const getMerchentList = createAsyncThunk(
  '/merchant/get-list',
  async (search, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchMerchantList(accessToken, search);

    return response;
  },
);

export const filterMerchentList = createAsyncThunk(
  '/merchant/get-list/?',
  async (data, {getState}) => {
    console.warn('data', data);
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await filterMerchantList(data, accessToken);
    console.log('i am here getting list', response.data.length);
    return response;
  },
);

export const getMerchantDetails = createAsyncThunk(
  '/merchant/get',
  async (id, {getState}) => {
    const {user} = getState().auth;
    const accessToken = user?.data?.access_token;
    const response = await fetchMerchantDetails(id, accessToken);
    return response;
  },
);

export const resetFilterStatus = createAction('merchant/resetFilterStatus');

export const merchentSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getMerchentList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.merchantList = action.payload;
      })
      .addCase(getMerchentList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(getMerchantDetails.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMerchantDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.merchantDetails = action.payload;
      })
      .addCase(getMerchantDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(filterMerchentList.pending, state => {
        state.status = 'loading';
        state.filterStatus = 'loading';
        state.error = null;
      })
      .addCase(filterMerchentList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filterStatus = 'succeeded';
        state.merchantList = action.payload;
      })
      .addCase(filterMerchentList.rejected, (state, action) => {
        state.status = 'failed';
        state.filterStatus = 'failed';
        state.error = action?.error?.message ?? 'Something went wrong.';
      })
      .addCase(resetFilterStatus, state => {
        state.filterStatus = 'idle';
      });
  },
});

export default merchentSlice.reducer;
