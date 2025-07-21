'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTaskStore } from '@/store/tasks';
import { useCategoryStore } from '@/store/categories';
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Plus
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },

];

export default function Sidebar() {
  const pathname = usePathname();
  const { tasks } = useTaskStore();
  const { categories } = useCategoryStore();

  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">TaskFlow</span>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Link
          href="/tasks"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            let badge = null;

            if (item.name === 'Tasks' && taskCounts.pending > 0) {
              badge = (
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {taskCounts.pending}
                </span>
              );
            }

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                  {badge}
                </Link>
              </li>
            );
          })}
        </ul>

        {categories.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <ul className="space-y-1">
              {categories.slice(0, 5).map((category) => {
                const categoryTaskCount = tasks.filter(t => t.category_id === category.id).length;
                return (
                  <li key={category.id}>
                    <Link
                      href={`/tasks?category=${category.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      {categoryTaskCount > 0 && (
                        <span className="text-xs text-gray-400">
                          {categoryTaskCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Task Summary Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Total Tasks</span>
            <span className="font-medium text-gray-900">{taskCounts.total}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Completed</span>
            <span className="font-medium text-green-600">{taskCounts.completed}</span>
          </div>
          {taskCounts.total > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(taskCounts.completed / taskCounts.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
