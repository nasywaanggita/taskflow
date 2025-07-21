'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/tasks';
import { useAuthStore } from '@/store/auth';
import { Task } from '@/types';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function RecentTasks() {
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user && tasks.length === 0) {
      fetchTasks(user.id);
    }
  }, [user, tasks.length, fetchTasks]);

  useEffect(() => {
    // Get 5 most recent tasks
    const recent = tasks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setRecentTasks(recent);
  }, [tasks]);

  const statusIcons = {
    todo: Clock,
    in_progress: Clock,
    done: CheckCircle2,
  };

  const statusColors = {
    todo: 'text-gray-500',
    in_progress: 'text-blue-500',
    done: 'text-green-500',
  };

  // Mock data untuk demo
  const mockTasks = [
    {
      id: 1,
      title: 'Setup TaskFlow Project',
      status: 'done' as const,
      priority: 'high' as const,
      category: { name: 'Work', color: '#3B82F6' },
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Test Authentication System',
      status: 'in_progress' as const,
      priority: 'medium' as const,
      category: { name: 'Development', color: '#10B981' },
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 3,
      title: 'Deploy to Production',
      status: 'todo' as const,
      priority: 'high' as const,
      category: { name: 'DevOps', color: '#F59E0B' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];

  const displayTasks = recentTasks.length > 0 ? recentTasks : mockTasks;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
        <Link 
          href="/tasks"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          View all →
        </Link>
      </div>

      {displayTasks.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 text-sm">No recent tasks</p>
          <Link 
            href="/tasks"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            
            return (
              <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <StatusIcon className={`h-5 w-5 ${statusColors[task.status]}`} />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-gray-900 truncate ${
                    task.status === 'done' ? 'line-through opacity-60' : ''
                  }`}>
                    {task.title}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    {task.category && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.category.color }}
                        />
                        <span className="text-xs text-gray-500">{task.category.name}</span>
                      </div>
                    )}
                    
                    <span className="text-xs text-gray-500">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}