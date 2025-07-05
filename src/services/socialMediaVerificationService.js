import api from './apiInterceptor';
import {BASEURL} from '../constants/api';

// Verify if user has actually posted on social media
export const verifySocialMediaPost = async (token, verificationData) => {
  try {
    const response = await api.post('/coupon/verify-social-post', verificationData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Social media verification error:', error);
    throw new Error(error?.response?.data?.message || 'Verification failed');
  }
};

// Get verification status for a coupon
export const getVerificationStatus = async (token, couponId) => {
  try {
    const response = await api.get(`/coupon/verification-status/${couponId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get verification status error:', error);
    throw new Error(error?.response?.data?.message || 'Failed to get verification status');
  }
};

// Submit verification proof (screenshot, post URL, etc.)
export const submitVerificationProof = async (token, proofData) => {
  try {
    const formData = new FormData();
    formData.append('coupon_id', proofData.couponId);
    formData.append('platform', proofData.platform);
    formData.append('post_url', proofData.postUrl);
    formData.append('screenshot', proofData.screenshot);
    formData.append('post_text', proofData.postText);
    formData.append('posted_at', proofData.postedAt);

    const response = await api.post('/coupon/submit-verification', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Submit verification proof error:', error);
    throw new Error(error?.response?.data?.message || 'Failed to submit verification proof');
  }
};

// Check if user can claim coupon (has verified social media post)
export const canClaimCoupon = async (token, couponId) => {
  try {
    const response = await api.get(`/coupon/can-claim/${couponId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Can claim coupon check error:', error);
    throw new Error(error?.response?.data?.message || 'Failed to check claim eligibility');
  }
};

// Get required social media platforms for a coupon
export const getRequiredPlatforms = async (token, couponId) => {
  try {
    const response = await api.get(`/coupon/required-platforms/${couponId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get required platforms error:', error);
    throw new Error(error?.response?.data?.message || 'Failed to get required platforms');
  }
}; 