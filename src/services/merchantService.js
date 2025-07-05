import api from './apiInterceptor';
import {BASEURL} from '../constants/api';

export const fetchMerchantList = (token, search = '') => {
  const url = `/merchant/get-list?search=${search}`;
  return api
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      console.log('error.message', error?.message);
      console.log('error.message', error?.response?.data);
      throw new Error(error.message);
    });
};

export const filterMerchantList = (queryParameters, token) => {
  // Validate required parameters
  if (!queryParameters.latitude || !queryParameters.longitude || !queryParameters.radius_in_km) {
    throw new Error('Missing required filter parameters');
  }
  
  const url = `/merchant/get-list?latitude=${queryParameters.latitude}&longitude=${queryParameters.longitude}&radius_in_km=${queryParameters.radius_in_km}`;
  
  return api
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw new Error(error?.response?.data?.message || error?.message || 'Filter request failed');
    });
};

export const fetchMerchantDetails = (id, token) => {
  return api
    .get(`/merchant/get?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      throw new Error(error.message);
    });
};
