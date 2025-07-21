import { getFCMToken } from '@/lib/firebase';
import { userApi } from '@/lib/api/users';
import { useAuthStore } from '@/store/auth';

export class FCMTokenService {
  private static instance: FCMTokenService;
  
  static getInstance(): FCMTokenService {
    if (!FCMTokenService.instance) {
      FCMTokenService.instance = new FCMTokenService();
    }
    return FCMTokenService.instance;
  }

  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getFCMToken();
      
      if (token) {
        console.log('FCM token obtained:', token);
        await this.updateUserFCMToken(token);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private async updateUserFCMToken(token: string): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      
      if (user) {
        await userApi.updateFCMToken(user.id, token);
        console.log('FCM token updated in backend');
      }
    } catch (error) {
      console.error('Error updating FCM token in backend:', error);
    }
  }

  async handleTokenRefresh(): Promise<void> {
    // Token refresh is handled automatically by Firebase SDK
    // This method can be called when app regains focus
    const token = await this.requestPermissionAndGetToken();
    if (token) {
      console.log('FCM token refreshed');
    }
  }
}

export const fcmService = FCMTokenService.getInstance();