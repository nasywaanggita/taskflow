'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useCategoryStore } from '@/store/categories';
import { fcmService } from '@/lib/fcm';
import { onMessageListener } from '@/lib/firebase';
import Header from './Header';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      
      // Setup FCM token and notifications
      setupFCMNotifications();
    }
  }, [isAuthenticated, fetchCategories]);

  const setupFCMNotifications = async () => {
    try {
      // Request permission and get FCM token
      await fcmService.requestPermissionAndGetToken();

      // Listen for foreground messages
      onMessageListener()
        .then((payload: any) => {
          console.log('Received foreground message:', payload);
          
          if (payload.notification) {
            toast.success(
              `${payload.notification.title}: ${payload.notification.body}`,
              {
                duration: 5000,
                position: 'top-right',
              }
            );
          }
        })
        .catch((err) => console.log('Failed to receive message:', err));

    } catch (error) {
      console.error('FCM setup error:', error);
    }
  };

  // Handle app visibility change (for token refresh)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fcmService.handleTokenRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
}