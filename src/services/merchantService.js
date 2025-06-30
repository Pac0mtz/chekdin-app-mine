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
  console.log('testing', queryParameters);
  const queryParams = new URLSearchParams(queryParameters);
  console.log('queryParams', queryParams);
  const url = `/merchant/get-list?latitude=${queryParameters.latitude}&longitude=${queryParameters.longitude}&radius_in_km=${queryParameters.radius_in_km}`;
  console.log('url is here', url);
  return api
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      console.log('this is response', response?.data?.data?.length);
      return response.data;
    })
    .catch(error => {
      console.log(error?.message);
      throw new Error(error.message);
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
