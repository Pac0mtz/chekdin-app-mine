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
  console.log("Social login data:", data);
  return axios
    .post(`${BASEURL}/auth/social-login`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log("Social login response:", response.data);
      return response.data;
    })
    .catch(error => {
      console.log("Social login error:", error.response?.data || error.message);
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        const err = error?.response?.data?.message;
        throw new Error(err);
      } else {
        throw new Error("Social login failed. Please try again.");
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
  console.log("Verifying email with data:", data);
  try {
    // Use regular axios instead of api interceptor to avoid authorization issues
    const response = await axios.post(`${BASEURL}/auth/verify-email`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("Verification response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Verification error:", error.response?.data || error.message);
    if (error?.response && error?.response?.data && error?.response?.data?.message) {
      const err = error?.response?.data?.message;
      throw new Error(err);
    } else {
      throw new Error("Verification failed. Please try again.");
    }
  }
};

export const resendOTP = async (email) => {
  console.log("Resending OTP to email:", email);
  try {
    const response = await axios.post(`${BASEURL}/auth/resend-otp`, { email }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("Resend OTP response:", response.data);
    return response.data;
  } catch (error) {
    console.log("Resend OTP error:", error.response?.data || error.message);
    if (error?.response && error?.response?.data && error?.response?.data?.message) {
      const err = error?.response?.data?.message;
      throw new Error(err);
    } else {
      throw new Error("Failed to resend OTP. Please try again.");
    }
  }
};

export const updateProfile = async (token, data) => {
  console.log("updateProfile called with token:", token ? "present" : "missing");
  console.log("updateProfile data:", data);
  
  try {
    const response = await api.patch('/auth/profile', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
      },
    });
    console.log("updateProfile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("updateProfile error:", error.response?.data || error.message);
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
