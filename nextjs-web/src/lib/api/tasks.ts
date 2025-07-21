import apiClient from './client';
import { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from '@/types';

export const taskApi = {
  // Get user tasks
  getUserTasks: async (
    userId: number, 
    filters?: { status?: string; category_id?: number }
  ): Promise<ApiResponse<Task[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    
    return apiClient.get(`/users/${userId}/tasks?${params.toString()}`);
  },

  // Create task
  createTask: async (task: CreateTaskRequest): Promise<ApiResponse<Task>> => {
    return apiClient.post('/tasks', task);
  },

  // Update task
  updateTask: async (id: number, task: UpdateTaskRequest): Promise<ApiResponse<Task>> => {
    return apiClient.put(`/tasks/${id}`, task);
  },

  // Delete task
  deleteTask: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/tasks/${id}`);
  },

  // Get task by ID
  getTask: async (id: number): Promise<ApiResponse<Task>> => {
    return apiClient.get(`/tasks/${id}`);
  },
};