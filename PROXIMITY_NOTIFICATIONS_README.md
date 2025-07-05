# 🔔 Proximity Notification System

A comprehensive push notification system that notifies users when new coupons are available within 20 miles of their location.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Frontend Implementation](#frontend-implementation)
- [Backend API Endpoints](#backend-api-endpoints)
- [Database Schema](#database-schema)
- [Firebase Configuration](#firebase-configuration)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The proximity notification system automatically notifies users when merchants create new coupons within a 20-mile radius of their current location. Users receive push notifications with coupon details and can tap to view the full offer.

### How It Works

1. **User opens app** → Registers for proximity notifications with location
2. **Merchant creates coupon** → Backend detects new coupon
3. **Backend finds nearby users** → Calculates distance (20-mile radius)
4. **Push notifications sent** → Users receive notification on device
5. **User taps notification** → App opens and navigates to coupon details

## ✨ Features

- **Real-time notifications** - Instant alerts when new coupons are posted
- **20-mile radius** - Configurable proximity detection
- **Rich notifications** - Includes coupon title, merchant name, and distance
- **Deep linking** - Direct navigation to coupon details
- **Background processing** - Works when app is closed
- **Location tracking** - Automatic location updates
- **Permission handling** - Graceful permission requests
- **Cross-platform** - Works on iOS and Android

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Firebase      │
│   (React Native)│    │   (API Server)  │    │   (FCM)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Register Location  │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │ 2. Merchant Creates   │                       │
         │    Coupon             │                       │
         │◀──────────────────────│                       │
         │                       │ 3. Find Nearby Users  │
         │                       │──────────────────────▶│
         │                       │                       │
         │ 4. Send Notification  │                       │
         │◀──────────────────────│◀──────────────────────│
         │                       │                       │
         │ 5. User Receives      │                       │
         │    Notification       │                       │
         │                       │                       │
```

## 📱 Frontend Implementation

### Components

- **`NearbyCouponsBanner`** - Shows latest nearby coupon on home screen
- **`proximityNotificationHandler`** - Handles notification logic and distance calculations
- **`proximityNotificationService`** - API service for backend communication
- **`proximityNotificationSlice`** - Redux state management

### Key Files

```
src/
├── services/
│   ├── proximityNotificationService.js    # API calls
│   └── testNotificationService.js         # Testing utilities
├── slices/
│   └── proximityNotificationSlice.js      # Redux state
├── utils/
│   └── proximityNotificationHandler.js    # Notification logic
├── ui/
│   ├── components/
│   │   └── NearbyCouponsBanner.js         # UI component
│   └── screens/
│       └── Home/home.js                   # Integration
└── store/
    └── index.js                           # Redux store
```

### Integration Points

- **Home Screen** - Registers for notifications and shows banner
- **Location Services** - Automatic registration when location obtained
- **Firebase Messaging** - Handles push notifications
- **Redux Store** - Manages notification state

## 🔌 Backend API Endpoints

### 1. Register User for Proximity Notifications

```http
POST /api/v1/notifications/register-proximity
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius_miles": 20,
  "notification_type": "coupon_proximity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered for proximity notifications",
  "data": {
    "user_id": "user123",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "radius": 20,
    "registered_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Update User Location

```http
PUT /api/v1/notifications/update-proximity-location
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius_miles": 20
}
```

### 3. Get Nearby Coupons

```http
GET /api/v1/coupons/nearby?latitude=40.7128&longitude=-74.0060&radius_miles=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": "coupon123",
        "offer_title": "50% Off Pizza",
        "merchant_name": "Pizza Place",
        "merchant_id": "merchant456",
        "distance": 2.5,
        "expiry_date": "2024-02-15"
      }
    ],
    "total_count": 1,
    "radius": 20
  }
}
```

### 4. Send Proximity Notification

```http
POST /api/v1/notifications/send-proximity
```

**Request Body:**
```json
{
  "coupon_id": "coupon123",
  "merchant_id": "merchant456",
  "merchant_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "coupon_data": {
    "offer_title": "50% Off Pizza",
    "merchant_name": "Pizza Place",
    "discount_amount": 50,
    "discount_type": "Percentage"
  },
  "radius_miles": 20
}
```

### 5. Check Notification Status

```http
GET /api/v1/notifications/proximity-status
```

### 6. Unregister from Notifications

```http
DELETE /api/v1/notifications/unregister-proximity
```

### 7. Test Notification

```http
POST /api/v1/notifications/send-test
```

**Request Body:**
```json
{
  "fcm_token": "user_fcm_token_here",
  "user_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "notification_type": "proximity_coupon",
  "test_data": {
    "couponId": "test-coupon-123",
    "merchantId": "test-merchant-456",
    "couponTitle": "Test Coupon",
    "merchantName": "Test Merchant",
    "distance": "2.5"
  }
}
```

## 🗄️ Database Schema

### Users Table (Add these fields)

```sql
ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN proximity_radius INTEGER DEFAULT 20;
ALTER TABLE users ADD COLUMN last_location_lat DECIMAL(10,8);
ALTER TABLE users ADD COLUMN last_location_lng DECIMAL(11,8);
ALTER TABLE users ADD COLUMN location_updated_at TIMESTAMP;
```

### Proximity Notifications Table

```sql
CREATE TABLE proximity_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  coupon_id INTEGER REFERENCES coupons(id),
  merchant_id INTEGER REFERENCES merchants(id),
  distance DECIMAL(5,2),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL
);
```

## 🔥 Firebase Configuration

### Initialize Firebase Admin

```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com"
});
```

### Send Notification Function

```javascript
async function sendProximityNotification(userFcmToken, couponData) {
  try {
    const message = {
      token: userFcmToken,
      notification: {
        title: 'New Coupon Nearby! 🎉',
        body: `${couponData.offer_title} at ${couponData.merchant_name}`,
      },
      data: {
        type: 'proximity_coupon',
        couponId: couponData.id.toString(),
        merchantId: couponData.merchant_id.toString(),
        couponTitle: couponData.offer_title,
        merchantName: couponData.merchant_name,
        distance: couponData.distance.toString(),
      },
      android: {
        channelId: 'proximity-coupons',
        priority: 'high',
        sound: 'default',
        color: '#02676C',
      },
      ios: {
        sound: 'default',
        badge: 1,
        categoryId: 'proximity-coupon',
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

### Find Nearby Users Function

```javascript
async function findNearbyUsers(merchantLat, merchantLng, radiusMiles = 20) {
  const query = `
    SELECT id, fcm_token, last_location_lat, last_location_lng
    FROM users 
    WHERE notification_enabled = true 
    AND fcm_token IS NOT NULL
    AND last_location_lat IS NOT NULL
    AND last_location_lng IS NOT NULL
  `;
  
  const users = await db.query(query);
  
  return users.filter(user => {
    const distance = calculateDistance(
      merchantLat, merchantLng,
      user.last_location_lat, user.last_location_lng
    );
    return distance <= radiusMiles;
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## 🚀 Installation & Setup

### Frontend Setup

1. **Install dependencies**
```bash
npm install @react-native-firebase/messaging
npm install react-native-toast-message
```

2. **Add to Redux store**
```javascript
// src/store/index.js
import proximityNotificationReducer from '../slices/proximityNotificationSlice';

const store = configureStore({
  reducer: {
    // ... other reducers
    proximityNotifications: proximityNotificationReducer,
  },
});
```

3. **Configure Firebase**
   - Add `google-services.json` (Android)
   - Add `GoogleService-Info.plist` (iOS)
   - Configure Firebase project

### Backend Setup

1. **Install Firebase Admin**
```bash
npm install firebase-admin
```

2. **Add database migrations**
```sql
-- Run the SQL commands from Database Schema section
```

3. **Implement API endpoints**
   - Create the endpoints listed above
   - Add Firebase integration
   - Add distance calculation logic

4. **Configure environment variables**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## 🧪 Testing

### Frontend Testing

1. **Run the app**
2. **Check console logs** for:
   - `🔔 Requesting notification permissions...`
   - `🔔 FCM Token received:`
   - `🔔 Subscribed to "proximity_coupons" topic`

3. **Tap "🧪 Test Notifications" button**
4. **Verify notifications appear**

### Backend Testing

1. **Test registration endpoint**
```bash
curl -X POST /api/v1/notifications/register-proximity \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "radius_miles": 20}'
```

2. **Test notification sending**
```bash
curl -X POST /api/v1/notifications/send-test \
  -H "Content-Type: application/json" \
  -d '{"fcm_token": "test_token", "user_location": {"latitude": 40.7128, "longitude": -74.0060}}'
```

### Integration Testing

1. **Create test coupon** via merchant interface
2. **Verify notifications** sent to nearby users
3. **Test notification tapping** and navigation

## 🔧 Troubleshooting

### Common Issues

**❌ No notifications received**
- Check device notification settings
- Verify FCM token generation
- Check Firebase project configuration
- Ensure backend is sending notifications

**❌ Permission denied**
- Go to device Settings > Apps > Your App > Notifications
- Enable notifications manually
- Check app permissions

**❌ FCM token not generated**
- Verify Firebase configuration files
- Check network connectivity
- Ensure Firebase project is active

**❌ Backend errors**
- Check Firebase Admin SDK configuration
- Verify database schema
- Check API endpoint implementation
- Review server logs

### Debug Steps

1. **Check console logs** for 🔔 and 🧪 emojis
2. **Verify FCM token** is generated
3. **Test permissions** are granted
4. **Check backend logs** for errors
5. **Verify Firebase project** is configured correctly

### Log Analysis

**Frontend logs to look for:**
```
🔔 Requesting notification permissions...
🔔 Authorization status: AUTHORIZED
🔔 FCM Token received: YES
🔔 Subscribed to "proximity_coupons" topic
🧪 Testing notification system...
```

**Backend logs to look for:**
```
Sending proximity notification to user: user123
Notification sent successfully: message_id_123
Found 15 users within 20 miles
```

## 📱 User Experience

### Notification Content

**Push Notification:**
```
Title: "New Coupon Nearby! 🎉"
Body: "50% Off Pizza at Pizza Place"
Distance: "2.5 miles away"
```

**Home Screen Banner:**
```
🎉 New Coupon Nearby!
50% Off Pizza at Pizza Place
2.5 miles away →
```

### User Flow

1. **User opens app** → Automatically registers for notifications
2. **User sees banner** → Latest nearby coupon displayed
3. **Merchant creates coupon** → User receives push notification
4. **User taps notification** → App opens to coupon details
5. **User redeems coupon** → Success!

## 🔄 Implementation Flow

### When Merchant Creates Coupon

```javascript
// 1. Save coupon to database
const coupon = await saveCoupon(couponData);

// 2. Find nearby users
const nearbyUsers = await findNearbyUsers(
  merchant.latitude, 
  merchant.longitude, 
  20
);

// 3. Send notifications to each user
for (const user of nearbyUsers) {
  await sendProximityNotification(user.fcm_token, {
    ...coupon,
    merchant_name: merchant.name,
    distance: calculateDistance(
      merchant.latitude, merchant.longitude,
      user.last_location_lat, user.last_location_lng
    )
  });
}
```

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review console logs
- Verify Firebase configuration
- Test with the provided test endpoints

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Compatibility:** React Native, Firebase, Node.js 