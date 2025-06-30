import {Platform, Alert, Linking} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  check,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';

class PermissionHandler {
  // Check permission status
  static async checkPermission(permission) {
    try {
      const result = await check(permission);
      return result;
    } catch (error) {
      console.error('Error checking permission:', error);
      return RESULTS.DENIED;
    }
  }

  // Request camera permission
  static async requestCameraPermission() {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return this.handlePermissionResult(result, 'Camera');
      } else {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        return this.handlePermissionResult(result, 'Camera');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request camera permission.',
      });
      return false;
    }
  }

  // Request location permission
  static async requestLocationPermission() {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return this.handlePermissionResult(result, 'Location');
      } else {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return this.handlePermissionResult(result, 'Location');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request location permission.',
      });
      return false;
    }
  }

  // Request microphone permission
  static async requestMicrophonePermission() {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return this.handlePermissionResult(result, 'Microphone');
      } else {
        const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        return this.handlePermissionResult(result, 'Microphone');
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request microphone permission.',
      });
      return false;
    }
  }

  // Request photo library permission
  static async requestPhotoLibraryPermission() {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return this.handlePermissionResult(result, 'Photo Library');
      } else {
        const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        return this.handlePermissionResult(result, 'Photo Library');
      }
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request photo library permission.',
      });
      return false;
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.NOTIFICATIONS);
        return this.handlePermissionResult(result, 'Notifications');
      } else {
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return this.handlePermissionResult(result, 'Notifications');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to request notification permission.',
      });
      return false;
    }
  }

  // Handle permission result
  static handlePermissionResult(result, permissionName) {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log(
          `${permissionName} permission is not available on this device`,
        );
        Toast.show({
          type: 'error',
          text1: 'Permission Unavailable',
          text2: `${permissionName} permission is not available on this device.`,
        });
        return false;

      case RESULTS.DENIED:
        console.log(`${permissionName} permission denied`);
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: `${permissionName} permission was denied.`,
        });
        return false;

      case RESULTS.LIMITED:
        console.log(`${permissionName} permission limited`);
        Toast.show({
          type: 'info',
          text1: 'Limited Permission',
          text2: `${permissionName} permission is limited.`,
        });
        return true;

      case RESULTS.GRANTED:
        console.log(`${permissionName} permission granted`);
        Toast.show({
          type: 'success',
          text1: 'Permission Granted',
          text2: `${permissionName} permission granted successfully.`,
        });
        return true;

      case RESULTS.BLOCKED:
        console.log(`${permissionName} permission blocked`);
        this.showPermissionSettingsAlert(permissionName);
        return false;

      default:
        return false;
    }
  }

  // Show alert to open settings
  static showPermissionSettingsAlert(permissionName) {
    Alert.alert(
      `${permissionName} Permission Required`,
      `This app needs ${permissionName.toLowerCase()} permission to function properly. Please enable it in Settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings().catch(() => {
              // Fallback to general settings
              Linking.openSettings();
            });
          },
        },
      ],
    );
  }

  // Request all necessary permissions for the app
  static async requestAllPermissions() {
    try {
      const permissions = {
        camera: await this.requestCameraPermission(),
        location: await this.requestLocationPermission(),
        notifications: await this.requestNotificationPermission(),
        photoLibrary: await this.requestPhotoLibraryPermission(),
      };

      return permissions;
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return {
        camera: false,
        location: false,
        notifications: false,
        photoLibrary: false,
      };
    }
  }

  // Check if all required permissions are granted
  static async checkAllPermissions() {
    try {
      const permissions = await this.requestAllPermissions();
      const allGranted = Object.values(permissions).every(granted => granted);

      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'Some permissions are required for the app to function properly. Please grant all permissions when prompted.',
          [
            {
              text: 'OK',
              onPress: () => this.requestAllPermissions(),
            },
          ],
        );
      }

      return allGranted;
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }

  // Request location with geolocation service
  static async requestLocationWithGeolocation() {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } else {
        const hasPermission = await this.requestLocationPermission();
        return hasPermission;
      }
    } catch (error) {
      console.error('Error requesting location with geolocation:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to request location permission.',
      });
      return false;
    }
  }

  // Get current location with proper error handling
  static getCurrentLocation(options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        ...options,
      };

      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        error => {
          console.error('Error getting current location:', error);
          let errorMessage = 'Unable to get your current location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Unable to get your current location.';
          }
          
          Toast.show({
            type: 'error',
            text1: 'Location Error',
            text2: errorMessage,
          });
          
          reject(error);
        },
        defaultOptions,
      );
    });
  }

  // Check if location services are enabled
  static async isLocationEnabled() {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we can't directly check if location services are enabled
        // We'll try to get the current position and see if it fails
        return new Promise((resolve) => {
          Geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
          );
        });
      } else {
        // For Android, we can check if location is enabled
        const hasPermission = await this.requestLocationPermission();
        return hasPermission;
      }
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }
}

export default PermissionHandler;
