import apiClient from './client';
import { User, ApiResponse } from '@/types';

export const userApi = {
  // Create user
  createUser: async (userData: {
    name: string;
    email: string;
    password?: string;
    firebase_uid?: string;
    fcm_token?: string;
  }): Promise<ApiResponse<User>> => {
    return apiClient.post('/users', userData);
  },

  // Get user by ID
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    return apiClient.get(`/users/${id}`);
  },

  // Get user by Firebase UID
  getUserByFirebaseUID: async (firebaseUID: string): Promise<ApiResponse<User>> => {
    return apiClient.get(`/users/firebase/${firebaseUID}`);
  },

  // Update FCM token
  updateFCMToken: async (id: number, fcmToken: string): Promise<ApiResponse<User>> => {
    return apiClient.put(`/users/${id}/fcm-token`, { fcm_token: fcmToken });
  },

  // Update user profile
  updateProfile: async (id: number, userData: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse<User>> => {
    return apiClient.put(`/users/${id}`, userData);
  },
};