'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { dashboardApi } from '@/lib/api/dashboard';
import { DashboardData } from '@/types';
import Layout from '@/components/layout/Layout';
import StatsCards from '@/components/dashboard/StatsCards';
import TaskChart from '@/components/dashboard/TaskChart';
import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await dashboardApi.getStats();
        setDashboardData(response.data);
      } catch (error: any) {
        toast.error(error.error || 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights into your productivity and task completion patterns</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Stats Overview */}
            <StatsCards stats={dashboardData.stats} />

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskChart 
                tasksByStatus={dashboardData.tasks_by_status}
                tasksByCategory={dashboardData.tasks_by_category}
              />
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Productivity</h3>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dashboardData.stats.completed_tasks} tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(dashboardData.stats.completion_rate, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardData.stats.completion_rate.toFixed(1)}% completion rate
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Focus Time</h3>
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">4.2h</p>
                  <p className="text-sm text-gray-600">Average daily focus</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-green-600">+12%</span>
                    <span className="text-sm text-gray-500">from last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((dashboardData.stats.completed_tasks / Math.max(dashboardData.stats.total_tasks, 1)) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Monthly goal progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((dashboardData.stats.completed_tasks / Math.max(dashboardData.stats.total_tasks, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Streak</h3>
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">7</p>
                  <p className="text-sm text-gray-600">Days active</p>
                  <p className="text-xs text-gray-500">Keep it up! 🔥</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load analytics data</p>
          </div>
        )}
      </div>
    </Layout>
  );
}