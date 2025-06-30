import axios from 'axios';
import {BASEURL} from '../constants/api';
import SessionManager from '../utils/sessionManager';
import Toast from 'react-native-toast-message';

// Create axios instance
const api = axios.create({
  baseURL: BASEURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    try {
      // Get user session for token
      const userData = await SessionManager.getSession();
      console.log('SessionManager.getSession:', userData);
      if (userData?.data?.access_token) {
        config.headers.Authorization = `Bearer ${userData.data.access_token}`;
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // Remove session expiration logic for 401
    if (error.response && error.response.status === 401) {
      Toast.show({
        type: 'error',
        text1: 'Unauthorized',
        text2: 'You are not authorized to perform this action.',
      });
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection and try again.',
      });
      return Promise.reject(
        new Error('Network error. Please check your connection.'),
      );
    }

    // Handle 403 Forbidden errors
    if (error.response.status === 403) {
      Toast.show({
        type: 'error',
        text1: 'Access Denied',
        text2: "You don't have permission to perform this action.",
      });
      return Promise.reject(new Error('Access denied.'));
    }

    // Handle 404 Not Found errors
    if (error.response.status === 404) {
      Toast.show({
        type: 'error',
        text1: 'Not Found',
        text2: 'The requested resource was not found.',
      });
      return Promise.reject(new Error('Resource not found.'));
    }

    // Handle 500 Server errors
    if (error.response.status >= 500) {
      Toast.show({
        type: 'error',
        text1: 'Server Error',
        text2: 'Something went wrong on our end. Please try again later.',
      });
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle validation errors (422)
    if (error.response.status === 422) {
      const errorMessage =
        error.response.data?.message || 'Validation error occurred.';
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: errorMessage,
      });
      return Promise.reject(new Error(errorMessage));
    }

    // Handle rate limiting (429)
    if (error.response.status === 429) {
      Toast.show({
        type: 'error',
        text1: 'Too Many Requests',
        text2: 'Please wait a moment before trying again.',
      });
      return Promise.reject(
        new Error('Too many requests. Please wait and try again.'),
      );
    }

    // Handle other errors
    const errorMessage =
      error.response.data?.message || 'An unexpected error occurred.';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });

    return Promise.reject(new Error(errorMessage));
  },
);

// Helper function to handle API calls with better error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return response;
  } catch (error) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

// Helper function for file uploads
export const uploadFile = async (url, formData, onProgress) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;
