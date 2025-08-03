import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export class AuthService {
  // Simple authentication using email (for users created with simplified registration)
  static async authenticateUser(email: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('🔍 [AuthService] Looking up user by email:', email);
      
      // Get all users and find by email
      const result = await api.getAllUsers();
      
      if (result.success && result.users) {
        const user = result.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          console.log('✅ [AuthService] User found:', user);
          
          // Give initial credits if user doesn't have any
          try {
            const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.208:3001';
            await fetch(`${API_BASE_URL}/api/users/${user.id}/give-initial-credits`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            console.log('✅ [AuthService] Initial credits check completed');
          } catch (creditError) {
            console.log('⚠️ [AuthService] Could not check/give initial credits:', creditError);
          }
          
          return {
            success: true,
            user: user
          };
        } else {
          console.log('❌ [AuthService] User not found for email:', email);
          return {
            success: false,
            error: 'User not found'
          };
        }
      } else {
        console.error('❌ [AuthService] Failed to fetch users:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch users'
        };
      }
    } catch (error) {
      console.error('💥 [AuthService] Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Create a simple session for database users
  static createSession(user: any): UserSession {
    return {
      id: user.clerk_user_id,
      name: user.name,
      email: user.email,
      isAuthenticated: true
    };
  }

  // Store session in localStorage (for web) or AsyncStorage (for mobile)
  static async storeSession(session: UserSession): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web environment
        localStorage.setItem('userSession', JSON.stringify(session));
        console.log('💾 [AuthService] Session stored in localStorage');
      } else {
        // Mobile environment - use AsyncStorage
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
        console.log('💾 [AuthService] Session stored in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ [AuthService] Failed to store session:', error);
    }
  }

  // Get stored session
  static async getStoredSession(): Promise<UserSession | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web environment
        const session = localStorage.getItem('userSession');
        if (session) {
          const parsedSession = JSON.parse(session);
          console.log('📋 [AuthService] Retrieved session from localStorage:', parsedSession);
          return parsedSession;
        }
      } else {
        // Mobile environment - use AsyncStorage
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          const parsedSession = JSON.parse(session);
          console.log('📋 [AuthService] Retrieved session from AsyncStorage:', parsedSession);
          return parsedSession;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ [AuthService] Failed to get stored session:', error);
      return null;
    }
  }

  // Clear stored session
  static async clearSession(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web environment
        localStorage.removeItem('userSession');
        console.log('🗑️ [AuthService] Session cleared from localStorage');
      } else {
        // Mobile environment - use AsyncStorage
        await AsyncStorage.removeItem('userSession');
        console.log('🗑️ [AuthService] Session cleared from AsyncStorage');
      }
    } catch (error) {
      console.error('❌ [AuthService] Failed to clear session:', error);
    }
  }
} 