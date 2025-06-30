import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import {clearUser, saveUser} from '../slices/authSlice';

class SessionManager {
  static SESSION_KEY = 'userSession';
  static SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Save user session with timestamp
  static async saveSession(userData) {
    try {
      const sessionData = {
        user: userData,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.SESSION_TIMEOUT,
      };
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  // Get current session
  static async getSession() {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        await this.clearSession();
        return null;
      }

      // Extend session if it's still valid
      await this.extendSession();
      return session.user;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Extend session timeout
  static async extendSession() {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return false;
      }

      const session = JSON.parse(sessionData);
      session.expiresAt = Date.now() + this.SESSION_TIMEOUT;

      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  // Clear session
  static async clearSession() {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      store.dispatch(clearUser());
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  // Check if session is valid
  static async isSessionValid() {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  // Initialize session on app start
  static async initializeSession() {
    try {
      const userData = await this.getSession();
      if (userData) {
        store.dispatch(saveUser(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing session:', error);
      return false;
    }
  }

  // Refresh session periodically
  static startSessionRefresh() {
    // Refresh session every 30 minutes
    setInterval(async () => {
      const isValid = await this.isSessionValid();
      if (isValid) {
        await this.extendSession();
      }
    }, 30 * 60 * 1000); // 30 minutes
  }
}

export default SessionManager;
