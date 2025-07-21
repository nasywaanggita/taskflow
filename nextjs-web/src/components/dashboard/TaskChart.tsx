'use client';

import { TasksByStatus, TasksByCategory } from '@/types';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface TaskChartProps {
  tasksByStatus: TasksByStatus[];
  tasksByCategory: TasksByCategory[];
}

const statusColors = {
  todo: '#6B7280',
  in_progress: '#3B82F6', 
  done: '#10B981',
};

const statusIcons = {
  todo: '📋',
  in_progress: '🚀',
  done: '✅',
};

const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function TaskChart({ tasksByStatus, tasksByCategory }: TaskChartProps) {
  const formatStatusData = tasksByStatus.map((item) => ({
    name: item.status
      .replace('_', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.task_count,
    color: statusColors[item.status as keyof typeof statusColors] || '#6B7280',
    icon: statusIcons[item.status as keyof typeof statusIcons] || '📝',
    percentage: 0, // Will be calculated below
  }));

  const formatCategoryData = tasksByCategory.map((item, index) => ({
    name: item.category_name,
    count: item.task_count,
    color: categoryColors[index % categoryColors.length],
    percentage: 0, // Will be calculated below
  }));

  // Calculate percentages
  const totalStatusTasks = formatStatusData.reduce((sum, item) => sum + item.count, 0);
  const totalCategoryTasks = formatCategoryData.reduce((sum, item) => sum + item.count, 0);

  formatStatusData.forEach(item => {
    item.percentage = totalStatusTasks > 0 ? (item.count / totalStatusTasks) * 100 : 0;
  });

  formatCategoryData.forEach(item => {
    item.percentage = totalCategoryTasks > 0 ? (item.count / totalCategoryTasks) * 100 : 0;
  });

  const maxStatusCount = Math.max(...formatStatusData.map(d => d.count), 1);
  const maxCategoryCount = Math.max(...formatCategoryData.map(d => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tasks by Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks by Status</h3>
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalStatusTasks}
          </div>
        </div>

        {formatStatusData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No task data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formatStatusData.map((item) => (
              <div key={item.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 group-hover:h-4 transition-all duration-200">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${(item.count / maxStatusCount) * 100}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks by Category */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks by Category</h3>
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalCategoryTasks}
          </div>
        </div>

        {formatCategoryData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No category data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formatCategoryData.map((item) => (
              <div key={item.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 group-hover:h-4 transition-all duration-200">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${(item.count / maxCategoryCount) * 100}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Task Distribution Summary</h4>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalStatusTasks}</p>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatStatusData.find(item => item.name === 'Done')?.count || 0}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {formatStatusData.find(item => item.name === 'In Progress')?.count || 0}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {formatCategoryData.length}
            </p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}