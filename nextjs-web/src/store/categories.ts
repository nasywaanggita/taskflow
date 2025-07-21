import { create } from 'zustand';
import { Category } from '@/types';
import { categoryApi } from '@/lib/api/categories';
import toast from 'react-hot-toast';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  selectedCategory: Category | null;

  // Actions
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  selectedCategory: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      const response = await categoryApi.getCategories();
      set({ categories: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.error || 'Failed to fetch categories');
    }
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },
}));