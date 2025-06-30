import api from './apiInterceptor';
import axios from 'axios';
import {BASEURL} from '../constants/api';

export const fetchCouponList = (token, search = '') => {
  console.log('fecth');
  return api
    .get(`/coupon/list?search=${search}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      console.log('error.error', error);
      throw new Error(error.message);
    });
};

export const iSCheckedIn = (token, coupon_id) => {
  console.log('fecth');
  return api
    .get(`/coupon/is-chekdin?coupon_id=${coupon_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      console.log('error.error', error);
      throw new Error(error.message);
    });
};

export const sendCheckinRequest = async (token, formData) => {
  console.log('formData checkin', formData);
  try {
    const response = await api.post(`/coupon/checkin`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(error.message);
  }
};

export const checkCouponView = async (token, formData) => {
  console.log('formData token ', formData);
  try {
    const response = await api.post(`/coupon/add-view`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('response.data on add view', response.data);
    return response.data;
  } catch (error) {
    console.log('error ==>', error?.response?.data);
    console.error('Error:', error);
    throw new Error(error.message);
  }
};

export const checkScanCouponData = async (token, data) => {
  try {
    const response = await api.post(
      `/coupon/scan-checkdin-coupon`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('error ==>', error);
    throw new Error(error.message);
  }
};

export const sendCheckinCount = async (token, data) => {
  console.log('formData', data);
  try {
    const response = await api.post(`/coupon/checkin/count`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error(error.message);
  }
};

export const fetchCouponDetails = (id, token) => {
  return api
    .get(`/coupon/get?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw new Error(error.message);
    });
};

export const fetchCouponStats = (data, token, search = '') => {
  console.warn('latlong', data);
  return api
    .get(`/coupon/stats`, {
      params: {
        search: search,
        latitude: data.lat,
        longitude: data.long,
        fcm_token: data.fcm_token,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw new Error(error.message);
    });
};

export const RedeemCoupon = async (id, token) => {
  console.log('RedeemCoupon -->', id);
  try {
    const response = await api.post(
      `/coupon/redeem-coupon?id=${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.data &&
      error.response.data.data.message
    ) {
      console.log('error ==>', error.response);
      throw new Error(error.response.data.data.message);
    } else {
      throw new Error('An error occurred while redeeming the coupon.');
    }
  }
};
