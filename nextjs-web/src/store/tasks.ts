import { create } from 'zustand';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';
import { taskApi } from '@/lib/api/tasks';
import toast from 'react-hot-toast';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  selectedTask: Task | null;
  filters: {
    status?: string;
    category_id?: number;
  };

  // Actions
  fetchTasks: (userId: number) => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: number, task: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: { status?: string; category_id?: number }) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  selectedTask: null,
  filters: {},

  fetchTasks: async (userId: number) => {
    try {
      set({ isLoading: true });
      const { filters } = get();
      const response = await taskApi.getUserTasks(userId, filters);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Failed to fetch tasks:', error);
      toast.error(error.error || 'Failed to fetch tasks');
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    try {
      const response = await taskApi.createTask(taskData);
      const newTask = response.data;
      
      set(state => ({
        tasks: [newTask, ...state.tasks]
      }));
      
      toast.success('Task created successfully!');
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.error || 'Failed to create task');
      throw error;
    }
  },

  updateTask: async (id: number, taskData: UpdateTaskRequest) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      const updatedTask = response.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }));
      
      toast.success('Task updated successfully!');
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(error.error || 'Failed to update task');
      throw error;
    }
  },

  deleteTask: async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }));
      
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.error || 'Failed to delete task');
      throw error;
    }
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  setFilters: (filters: { status?: string; category_id?: number }) => {
    set({ filters });
  },

  clearTasks: () => {
    set({ tasks: [], selectedTask: null, filters: {} });
  },
}));