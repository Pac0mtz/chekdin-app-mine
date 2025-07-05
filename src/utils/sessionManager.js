import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import {clearUser, saveUser} from '../slices/authSlice';

class SessionManager {
  static SESSION_KEY = 'userSession';

  // Save user session without expiration
  static async saveSession(userData) {
    try {
      const sessionData = {
        user: userData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  // Get current session without expiration check
  static async getSession() {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      return session.user;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
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

  // Check if session exists (no expiration check)
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
}

export default SessionManager;
