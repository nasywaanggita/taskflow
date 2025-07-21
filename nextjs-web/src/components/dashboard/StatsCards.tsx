'use client';

import { DashboardStats } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { CheckCircle, Clock, TrendingUp, Users, AlertTriangle, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { tasks } = useTaskStore();
  const [realTimeStats, setRealTimeStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    completionRate: 0,
    todayCompleted: 0,
    overdueTasks: 0,
    upcomingTasks: 0
  });

  // Calculate real-time stats from actual tasks data
  useEffect(() => {
    if (tasks.length > 0) {
      const today = new Date();
      
      const completed = tasks.filter(task => task.status === 'done').length;
      const inProgress = tasks.filter(task => task.status === 'in_progress').length;
      const todo = tasks.filter(task => task.status === 'todo').length;
      
      const todayCompleted = tasks.filter(task => {
        if (task.status !== 'done') return false;
        const updatedDate = new Date(task.updated_at);
        return updatedDate.toDateString() === today.toDateString();
      }).length;

      const overdue = tasks.filter(task => {
        if (!task.deadline || task.status === 'done') return false;
        return new Date(task.deadline) < today;
      }).length;

      const upcoming = tasks.filter(task => {
        if (!task.deadline || task.status === 'done') return false;
        const deadline = new Date(task.deadline);
        const timeDiff = deadline.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 3 && daysDiff > 0;
      }).length;

      const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

      setRealTimeStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        completionRate,
        todayCompleted,
        overdueTasks: overdue,
        upcomingTasks: upcoming
      });
    } else {
      // Use API stats if no tasks loaded yet
      setRealTimeStats({
        totalTasks: stats.total_tasks,
        completedTasks: stats.completed_tasks,
        inProgressTasks: stats.in_progress_tasks,
        todoTasks: stats.pending_tasks,
        completionRate: stats.completion_rate,
        todayCompleted: 0,
        overdueTasks: 0,
        upcomingTasks: 0
      });
    }
  }, [tasks, stats]);

  // Calculate changes (mock previous week data for demo)
  const calculateChange = (current: number, baseValue: number = 10) => {
    const previous = Math.max(0, baseValue - Math.floor(Math.random() * 3));
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };

  const cards = [
    {
      title: 'Total Tasks',
      value: realTimeStats.totalTasks,
      icon: Clock,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: calculateChange(realTimeStats.totalTasks, 8),
      description: `${realTimeStats.todoTasks} pending, ${realTimeStats.inProgressTasks} active`
    },
    {
      title: 'Completed Tasks',
      value: realTimeStats.completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: calculateChange(realTimeStats.completedTasks, 5),
      description: `${realTimeStats.todayCompleted} completed today`
    },
    {
      title: 'In Progress',
      value: realTimeStats.inProgressTasks,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: calculateChange(realTimeStats.inProgressTasks, 3),
      description: 'Currently being worked on'
    },
    {
      title: 'Completion Rate',
      value: `${realTimeStats.completionRate.toFixed(1)}%`,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: calculateChange(realTimeStats.completionRate, 60),
      description: `${realTimeStats.totalTasks - realTimeStats.completedTasks} remaining`
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium flex items-center ${
                card.change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change.isPositive ? '↗️' : '↘️'}
                {card.change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">from last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today's Activity */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Today's Completed</p>
              <p className="text-xl font-bold text-green-600">{realTimeStats.todayCompleted}</p>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        <div className={`border rounded-lg p-4 ${
          realTimeStats.overdueTasks > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`h-5 w-5 mr-2 ${
              realTimeStats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-400'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                realTimeStats.overdueTasks > 0 ? 'text-red-900' : 'text-gray-600'
              }`}>Overdue Tasks</p>
              <p className={`text-xl font-bold ${
                realTimeStats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-500'
              }`}>{realTimeStats.overdueTasks}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Due */}
        <div className={`border rounded-lg p-4 ${
          realTimeStats.upcomingTasks > 0 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            <Clock className={`h-5 w-5 mr-2 ${
              realTimeStats.upcomingTasks > 0 ? 'text-yellow-600' : 'text-gray-400'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                realTimeStats.upcomingTasks > 0 ? 'text-yellow-900' : 'text-gray-600'
              }`}>Due Soon</p>
              <p className={`text-xl font-bold ${
                realTimeStats.upcomingTasks > 0 ? 'text-yellow-600' : 'text-gray-500'
              }`}>{realTimeStats.upcomingTasks}</p>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-indigo-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-indigo-900">Total Users</p>
              <p className="text-xl font-bold text-indigo-600">{stats.total_users}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar with Real-time Data */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
          <span className="text-sm font-medium text-gray-900">
            {realTimeStats.completedTasks} of {realTimeStats.totalTasks} tasks completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(realTimeStats.completionRate, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-xs text-gray-500">
            <span>Todo: {realTimeStats.todoTasks}</span>
            <span>In Progress: {realTimeStats.inProgressTasks}</span>
            <span>Done: {realTimeStats.completedTasks}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {realTimeStats.completionRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}