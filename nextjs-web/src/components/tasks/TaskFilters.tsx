'use client';

import { useTaskStore } from '@/store/tasks';
import { useCategoryStore } from '@/store/categories';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function TaskFilters() {
  const { filters, setFilters } = useTaskStore();
  const { categories } = useCategoryStore();
  const [showFilters, setShowFilters] = useState(true); // bisa default true atau false

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const handleStatusChange = (status: string) => {
    setFilters({ 
      ...filters, 
      status: status !== '' ? status : undefined 
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters({ 
      ...filters, 
      category_id: categoryId ? parseInt(categoryId) : undefined 
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.status || filters.category_id;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filters Form */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category_id?.toString() || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
