import axios from 'axios';
import {store} from '../store';
import {clearUser} from '../slices/authSlice';
import SessionManager from './sessionManager';
import Toast from 'react-native-toast-message';

// Create axios instance
const apiClient = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async config => {
    try {
      // Get session data
      const session = await SessionManager.getSession();
      if (session?.data?.access_token) {
        config.headers.Authorization = `Bearer ${session.data.access_token}`;
      }
      
      // Update last activity
      await SessionManager.updateLastActivity();
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear session and redirect to login
        await SessionManager.clearSession();
        
        // Instead of showing 'Session Expired', show a generic error or nothing

        // You can add navigation logic here if needed
        return Promise.reject(error);
      } catch (clearError) {
        console.error('Error clearing session:', clearError);
        return Promise.reject(error);
      }
    }

    // Handle network errors
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection and try again.',
      });
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      Toast.show({
        type: 'error',
        text1: 'Server Error',
        text2: 'Something went wrong on our end. Please try again later.',
      });
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });

    return Promise.reject(error);
  },
);

// Helper function to make API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return {success: true, data: response};
  } catch (error) {
    console.error('API call error:', error);
    return {success: false, error: error.message || 'Something went wrong'};
  }
};

// Helper function to handle loading states
export const withLoading = async (loadingSetter, apiFunction, ...args) => {
  try {
    loadingSetter(true);
    const result = await apiCall(apiFunction, ...args);
    return result;
  } finally {
    loadingSetter(false);
  }
};

// Helper function to retry failed requests
export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000, ...args) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiCall(apiFunction, ...args);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.error(`API call attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
};

export default apiClient; 