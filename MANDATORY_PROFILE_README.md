# 📱 Mandatory Profile Collection System

A comprehensive system that forces users to provide their name and phone number after every login to continue using the ChekdIn app and receive SMS marketing offers.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Flow](#user-flow)
- [Components](#components)
- [Services](#services)
- [Redux State Management](#redux-state-management)
- [SMS Marketing Integration](#sms-marketing-integration)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The mandatory profile collection system ensures that every user provides their name and phone number before they can continue using the ChekdIn app. The system uses a progressive approach:

- **1st & 2nd login**: Gentle reminder that can be dismissed
- **3rd login onwards**: Mandatory completion required (cannot be skipped)

This approach balances user experience with data collection goals, ensuring maximum user data collection for SMS marketing campaigns.

### Key Benefits

- **100% User Data Collection** - No users can skip providing their information
- **SMS Marketing Ready** - Phone numbers are validated and formatted for SMS campaigns
- **Marketing Consent** - Users must explicitly agree to receive offers via text message
- **Zapier Integration** - Automatic data sync to SMS marketing platforms
- **User Experience** - Clear explanation of why the information is needed

## ✨ Features

- **Progressive Reminder System** - Gentle reminders for first 2 logins, mandatory after 3rd
- **Login Attempt Tracking** - Tracks number of login attempts per user
- **Smart Modal Behavior** - Dismissible for first 2 attempts, non-dismissible after 3rd
- **Real-time Validation** - Phone number format validation
- **Marketing Consent** - Required checkbox for SMS marketing
- **Zapier Webhook** - Automatic data sync to marketing platforms
- **Profile Integration** - Updates user profile in backend
- **Error Handling** - Comprehensive error messages and retry logic
- **Debug Tools** - Development utilities for testing

## 🔄 User Flow

```
1. User logs in → App checks profile completion
2. If missing name/phone → Check login attempt count
3. 1st/2nd attempt → Gentle reminder modal (dismissible)
4. 3rd+ attempt → Mandatory modal (non-dismissible)
5. User fills form → Real-time validation
6. User accepts marketing consent → Required to continue
7. Form submission → Updates profile + sends to Zapier
8. Success → Modal closes, attempts reset, user can use app
9. Failure → Error message, user must retry
```

## 🧩 Components

### MandatoryProfileModal

**Location:** `src/ui/modules/MandatoryProfileModal/index.js`

**Features:**
- Non-dismissible modal
- Name and phone number input fields
- Marketing consent checkbox (required)
- Real-time validation
- Error handling and display
- Benefits explanation section
- Submit and logout options

**Props:**
```javascript
{
  visible: boolean,           // Controls modal visibility
  onClose: function,          // Called when user tries to close
  onComplete: function,       // Called when profile is completed
  userData: object,          // Current user profile data
  isMandatory: boolean,      // Whether modal is mandatory (3rd+ attempt)
  loginAttempts: number      // Number of login attempts
}
```

**Key Features:**
- **Smart Dismissal** - Dismissible for first 2 attempts, non-dismissible after 3rd
- **Attempt Counter** - Shows current reminder number
- **Progressive Messaging** - Different messages based on attempt count
- **Validation** - Real-time phone number validation
- **Marketing Consent** - Required checkbox for SMS marketing
- **Benefits Section** - Explains why information is needed
- **Error Handling** - Clear error messages
- **Loading States** - Shows submission progress

## 🔧 Services

### SMSMarketingService

**Location:** `src/services/smsMarketingService.js`

**Methods:**
- `sendToZapier(userData)` - Sends user data to Zapier webhook
- `validatePhoneNumber(phone)` - Validates and formats phone numbers
- `updateMarketingConsent(consentData)` - Updates backend consent status
- `getMarketingConsent(accessToken)` - Gets current consent status
- `sendWelcomeSMS(phoneNumber, userName)` - Sends welcome SMS
- `hasMarketingConsent(userProfile)` - Checks if user has consented
- `hasRequiredProfileInfo(userProfile)` - Checks if profile is complete

**Phone Validation:**
```javascript
// Supports multiple formats:
// US: (555) 123-4567
// International: +1 (555) 123-4567
// Raw: 5551234567
```

## 📊 Redux State Management

### MandatoryProfileSlice

**Location:** `src/slices/mandatoryProfileSlice.js`

**State:**
```javascript
{
  isProfileComplete: boolean,
  isModalVisible: boolean,
  isMandatory: boolean,        // Whether modal is mandatory (3rd+ attempt)
  loginAttempts: number,       // Number of login attempts
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null,
  lastChecked: string | null
}
```

**Actions:**
- `checkProfileCompletion(userProfile)` - Checks if profile is complete and tracks attempts
- `markProfileComplete()` - Marks profile as complete and resets attempts
- `showMandatoryProfileModal()` - Shows the modal with attempt tracking
- `resetLoginAttempts()` - Resets login attempts for testing
- `showModal()` - Shows modal manually
- `hideModal()` - Hides modal
- `reset()` - Resets state

**Selectors:**
- `selectIsProfileComplete` - Profile completion status
- `selectIsModalVisible` - Modal visibility
- `selectIsMandatory` - Whether modal is mandatory (3rd+ attempt)
- `selectLoginAttempts` - Number of login attempts
- `selectProfileStatus` - Current status
- `selectProfileError` - Error message
- `selectLastChecked` - Last check timestamp

## 📱 SMS Marketing Integration

### Zapier Webhook

**Endpoint:** `https://hooks.zapier.com/hooks/catch/5642269/ubba5lk/`

**Data Sent:**
```json
{
  "name": "John Doe",
  "phone": "5551234567",
  "email": "john@example.com",
  "marketing_consent": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "ChekdIn App",
  "platform": "mobile"
}
```

### Marketing Consent Flow

1. **User checks box** → Required to continue
2. **Form submission** → Data sent to Zapier
3. **Backend update** → Profile updated with consent
4. **SMS campaign** → User added to marketing list

## 🚀 Installation & Setup

### 1. Add to Redux Store

```javascript
// src/store/index.js
import mandatoryProfileReducer from '../slices/mandatoryProfileSlice';

const store = configureStore({
  reducer: {
    // ... other reducers
    mandatoryProfile: mandatoryProfileReducer,
  },
});
```

### 2. Import in App.js

```javascript
// App.js
import MandatoryProfileModal from './src/ui/modules/MandatoryProfileModal';
import {
  checkProfileCompletion,
  showMandatoryProfileModal,
  selectIsModalVisible,
  selectIsProfileComplete,
} from './src/slices/mandatoryProfileSlice';
```

### 3. Add Profile Check Logic

```javascript
// Check profile completion on login
useEffect(() => {
  if (user && user.data && user.data.email && profile) {
    dispatch(checkProfileCompletion(profile.data));
  }
}, [profile, user, dispatch]);
```

### 4. Add Modal to App

```javascript
<MandatoryProfileModal
  visible={isMandatoryProfileModalVisible}
  onClose={handleMandatoryProfileClose}
  onComplete={handleMandatoryProfileComplete}
  userData={profile?.data}
/>
```

## 🧪 Testing

### Debug Functions

**Show Modal:**
```javascript
// In console or debug menu
global.showMandatoryProfileModalDebug();
```

**Reset Profile Flag:**
```javascript
// Reset completion status
global.resetProfileCompletionFlag();
```

**Reset Login Attempts:**
```javascript
// Reset login attempts to test progressive system
global.resetLoginAttemptsDebug();
```

**Test Profile Update:**
```javascript
// Test profile update directly
global.testProfileUpdate();
```

### Manual Testing

1. **1st login with incomplete profile** → Gentle reminder modal appears (dismissible)
2. **2nd login** → Gentle reminder modal appears (dismissible)
3. **3rd login** → Mandatory modal appears (non-dismissible)
4. **Try to close modal** → Should not close on 3rd+ attempt
5. **Fill invalid phone** → Should show validation error
6. **Uncheck marketing consent** → Should show error
7. **Fill valid data** → Should submit successfully
8. **Check Zapier** → Data should appear in webhook
9. **Login again** → Modal should not appear (profile complete)

### Test Cases

- ✅ Modal appears for users missing name
- ✅ Modal appears for users missing phone
- ✅ Modal appears for users missing both
- ✅ 1st & 2nd attempts are dismissible
- ✅ 3rd+ attempts are non-dismissible
- ✅ Attempt counter shows correctly
- ✅ Progressive messaging works
- ✅ Phone validation works correctly
- ✅ Marketing consent is required
- ✅ Form submission updates profile
- ✅ Data sent to Zapier webhook
- ✅ Success message shown
- ✅ Modal closes after completion
- ✅ Login attempts reset after completion

## 🔧 Troubleshooting

### Common Issues

**❌ Modal not appearing**
- Check if user has complete profile
- Verify Redux state is correct
- Check console for errors

**❌ Form not submitting**
- Check network connectivity
- Verify API endpoints
- Check backend response

**❌ Zapier not receiving data**
- Check webhook URL
- Verify data format
- Check Zapier logs

**❌ Phone validation failing**
- Check phone number format
- Verify validation logic
- Test with different formats

### Debug Steps

1. **Check Redux state:**
```javascript
// In console
console.log(store.getState().mandatoryProfile);
```

2. **Check user profile:**
```javascript
// In console
console.log(store.getState().auth.profile);
```

3. **Test validation:**
```javascript
// In console
import SMSMarketingService from './src/services/smsMarketingService';
SMSMarketingService.validatePhoneNumber('5551234567');
```

4. **Test Zapier webhook:**
```javascript
// In console
fetch('https://hooks.zapier.com/hooks/catch/5642269/ubba5lk/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
});
```

### Log Analysis

**Look for these logs:**
```
✅ User data sent to SMS marketing system
✅ Profile update data: { name: "...", phone: "...", marketing_consent: true }
✅ Profile Updated Successfully!
⚠️ Failed to send to SMS marketing: HTTP 500
❌ Profile update error: Network error
```

## 📱 User Experience

### Modal Design

- **Clean, modern interface**
- **Clear explanation of requirements**
- **Benefits section explaining value**
- **Real-time validation feedback**
- **Loading states during submission**
- **Error messages for guidance**

### Messaging

**Title:** "Complete Your Profile"
**Subtitle:** "To continue using ChekdIn and receive exclusive offers via text messages, please provide your information below."

**Benefits:**
- 📱 Send you exclusive offers via text message
- 🎁 Personalized deals based on your location
- 🔔 Instant notifications for new coupons
- 💳 Secure account verification

### Marketing Consent

**Required checkbox:** "I agree to receive offers, promotions, and updates from ChekdIn via text message and email"

**Subtext:** "You can unsubscribe at any time. Message & data rates may apply."

## 🔒 Privacy & Compliance

### Data Collection

- **Name** - Required for personalization
- **Phone Number** - Required for SMS marketing
- **Email** - Already collected during signup
- **Marketing Consent** - Explicit opt-in required

### Compliance

- **Explicit Consent** - Users must check box to continue
- **Clear Purpose** - Explains why data is needed
- **Unsubscribe Option** - Mentioned in consent text
- **Data Security** - Sent via secure API endpoints

## 📈 Analytics & Tracking

### Events to Track

- `profile_modal_shown` - Modal displayed
- `profile_modal_completed` - Profile completed
- `profile_modal_skipped` - User chose logout
- `marketing_consent_given` - User agreed to marketing
- `zapier_sync_success` - Data sent successfully
- `zapier_sync_failed` - Data sync failed

### Metrics to Monitor

- **Completion Rate** - % of users who complete profile
- **Drop-off Rate** - % of users who choose logout
- **Validation Errors** - Common phone format issues
- **API Success Rate** - Profile update success rate
- **Zapier Sync Rate** - Marketing data sync success

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Compatibility:** React Native, Redux Toolkit, Zapier 