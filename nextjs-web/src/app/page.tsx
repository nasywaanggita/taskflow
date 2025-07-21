'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/tasks';
import { dashboardApi } from '@/lib/api/dashboard';
import { exportApi } from '@/lib/api/export';
import { DashboardData } from '@/types';
import Layout from '@/components/layout/Layout';
import StatsCards from '@/components/dashboard/StatsCards';
import TaskChart from '@/components/dashboard/TaskChart';
import RecentTasks from '@/components/dashboard/RecentTasks';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import LoginForm from '@/components/auth/LoginForm';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

const MESSAGES = {
  REFRESHING: 'Refreshing dashboard...',
  REFRESH_SUCCESS: 'Dashboard refreshed!',
  REFRESH_ERROR: 'Failed to refresh dashboard',
  LOAD_ERROR: 'Failed to load dashboard data',
  EXPORT_SUCCESS: 'Data exported successfully!',
  EXPORT_ERROR: 'Failed to export data'
} as const;

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, initializeAuth } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingData(true);
      const res = await dashboardApi.getStats();
      setDashboardData(res.data);
    } catch (err) {
      toast.error(MESSAGES.LOAD_ERROR);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    toast.loading(MESSAGES.REFRESHING, { id: 'refresh' });
    await Promise.all([fetchDashboardData(), user && fetchTasks(user.id)]);
    toast.success(MESSAGES.REFRESH_SUCCESS, { id: 'refresh' });
  };

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
      fetchTasks(user.id);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Loading TaskFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginForm />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-gray-600">Here’s your dashboard overview</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            {isLoadingData ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {!isLoadingData && dashboardData ? (
          <>
            <StatsCards stats={dashboardData.stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TaskChart 
                  tasksByStatus={dashboardData.tasks_by_status}
                  tasksByCategory={dashboardData.tasks_by_category}
                />
              </div>
              <div className="space-y-6">
                <RecentTasks />
                <WeatherWidget />
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Loading data...</p>
        )}
      </div>
    </Layout>
  );
}
