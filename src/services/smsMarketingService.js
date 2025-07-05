import {API_BASE_URL} from '../constants/api';

// SMS Marketing Service
class SMSMarketingService {
  // Send user data to Zapier webhook for SMS marketing
  static async sendToZapier(userData) {
    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/5642269/ubba5lk/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          marketing_consent: userData.marketing_consent,
          timestamp: new Date().toISOString(),
          source: 'ChekdIn App',
          platform: 'mobile'
        }),
      });

      if (response.ok) {
        console.log('✅ User data sent to Zapier successfully');
        return { success: true };
      } else {
        console.log('❌ Failed to send data to Zapier:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error sending data to Zapier:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user marketing consent in backend
  static async updateMarketingConsent(consentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/marketing-consent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consentData.access_token}`,
        },
        body: JSON.stringify({
          sms_consent: consentData.sms_consent,
          email_consent: consentData.email_consent,
          push_consent: consentData.push_consent,
          updated_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Marketing consent updated successfully');
        return { success: true, data };
      } else {
        console.log('❌ Failed to update marketing consent:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error updating marketing consent:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's current marketing consent status
  static async getMarketingConsent(accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user/marketing-consent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.data };
      } else {
        console.log('❌ Failed to get marketing consent:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error getting marketing consent:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome SMS (if backend supports it)
  static async sendWelcomeSMS(phoneNumber, userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sms/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          user_name: userName,
          message_type: 'welcome'
        }),
      });

      if (response.ok) {
        console.log('✅ Welcome SMS sent successfully');
        return { success: true };
      } else {
        console.log('❌ Failed to send welcome SMS:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Error sending welcome SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's between 10-15 digits
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { valid: false, error: 'Phone number must be between 10 and 15 digits' };
    }
    
    // Check if it starts with a valid country code or area code
    if (cleanPhone.length === 10) {
      // US format: (XXX) XXX-XXXX
      return { valid: true, formatted: `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}` };
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      // US format with country code: 1 (XXX) XXX-XXXX
      const areaCode = cleanPhone.slice(1, 4);
      const prefix = cleanPhone.slice(4, 7);
      const lineNumber = cleanPhone.slice(7);
      return { valid: true, formatted: `+1 (${areaCode}) ${prefix}-${lineNumber}` };
    } else {
      // International format
      return { valid: true, formatted: `+${cleanPhone}` };
    }
  }

  // Format phone number for display
  static formatPhoneNumber(phone) {
    const validation = this.validatePhoneNumber(phone);
    if (validation.valid) {
      return validation.formatted;
    }
    return phone; // Return original if validation fails
  }

  // Check if user has given marketing consent
  static hasMarketingConsent(userProfile) {
    return userProfile?.marketing_consent === '1' || 
           userProfile?.sms_consent === '1' || 
           userProfile?.marketing_consent === true;
  }

  // Check if user has provided required profile information
  static hasRequiredProfileInfo(userProfile) {
    const hasName = userProfile?.name && userProfile.name.trim() !== '';
    const hasPhone = userProfile?.phone_number && userProfile.phone_number.trim() !== '';
    return hasName && hasPhone;
  }
}

export default SMSMarketingService; 