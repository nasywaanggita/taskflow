export interface User {
  id: number;
  name: string;
  email: string;
  firebase_uid?: string;
  fcm_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  user_id: number;
  category_id: number;
  deadline?: string;
  reminder_sent_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  category?: Category;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  user_id: number;
  category_id: number;
  deadline?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  category_id?: number;
  deadline?: string;
}

export interface DashboardStats {
  total_users: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completion_rate: number;
}

export interface TasksByCategory {
  category_name: string;
  task_count: number;
}

export interface TasksByStatus {
  status: string;
  task_count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  tasks_by_category: TasksByCategory[];
  tasks_by_status: TasksByStatus[];
}

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feels_like: number;
  description: string;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  clouds: number;
  icon: string;
  timestamp: string;
  sunrise: string;
  sunset: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  error: string;
  details?: string;
  success: false;
}