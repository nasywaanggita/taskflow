import apiClient from './client';
import { Category, ApiResponse } from '@/types';

export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiClient.get('/categories');
  },

  // Get category by ID
  getCategory: async (id: number): Promise<ApiResponse<Category>> => {
    return apiClient.get(`/categories/${id}`);
  },
};