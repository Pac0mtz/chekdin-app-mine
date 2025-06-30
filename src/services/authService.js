import api from './apiInterceptor';
import axios from 'axios';
import { BASEURL } from '../constants/api';

export const LoginService = data => {
  console.warn('LoginService', data)
  return api
    .post('/auth/login', data)
    .then(response => response.data)
    .catch(error => {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message
        console.warn('err', err)
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const pushNotification = async (token, data) => {
  try {
    const response = await api.post('/misc/send-message', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export const socialLoginService = data => {
  console.log("data on social", data)
  return api
    .post('/auth/social-login', data)
    .then(response => response.data)
    .catch(error => {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        console.log("err", error?.response?.data?.message, error)
        const err = error?.response?.data?.message
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const forgotService = data => {
  return axios
    .post(`${BASEURL}/auth/forget-password`, data)
    .then(response => response.data)
    .catch(error => {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const changePasswordService = data => {
  return api
    .post('/auth/change-password', data)
    .then(response => response.data)
    .catch(error => {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const SignUpService = data => {
  console.log("data sent", data)
  return axios
    .post(`${BASEURL}/auth/customer-signup`, data)
    .then(response => response.data)
    .catch(error => {
      console.warn('error ====', error)
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const fetchProfile = token => {
  return api
    .get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => response.data)
    .catch(error => {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message
        throw new Error(err);
      } else {
        throw new Error("Err.");
      }
    });
};

export const verifyEmail = async (data) => {
  console.log("data", data)
  try {
    const response = await axios.post(`${BASEURL}/auth/verify-email`, data);
    return response.data;
  } catch (error) {
    console.log("error", error)
    if (error?.response && error?.response?.data && error?.response?.data?.message) {
      const err = error?.response?.data?.message
      throw new Error(err);
    } else {
      throw new Error("Err.");
    }
  }
};

export const updateProfile = async (token, data) => {
  console.log("token", token, "data", data)
  try {
    const response = await api.patch('/auth/profile', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (error?.response && error?.response?.data && error?.response?.data?.message) {
      const err = error?.response?.data?.message
      throw new Error(err);
    } else {
      throw new Error("Err.");
    }
  }
};

export const deleteAccountAPI = async (token) => {
  try {
    const response = await api.delete('/auth/delete-account', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};
