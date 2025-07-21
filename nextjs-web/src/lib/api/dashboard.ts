import apiClient from './client';
import { DashboardData, ApiResponse } from '@/types';

export const dashboardApi = {
  // Get dashboard stats
  getStats: async (): Promise<ApiResponse<DashboardData>> => {
    return apiClient.get('/dashboard/stats');
  },
};