'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/tasks';
import { exportApi } from '@/lib/api/export';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportButton() {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!user) {
      toast.error('User not found');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('Exporting tasks...', { id: 'export' });

      try {
        const blob = await exportApi.exportTasksCSV(user.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my_tasks_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Tasks exported successfully!', { id: 'export' });
      } catch (error) {
        console.log('Server export failed, using client-side export');
        exportApi.exportTasksClientSide(
          tasks,
          `my_tasks_${new Date().toISOString().split('T')[0]}.csv`
        );
        toast.success('Tasks exported successfully!', { id: 'export' });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export tasks', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        disabled={isExporting}
        onClick={(e) => {
          e.preventDefault();
          const dropdown = e.currentTarget.nextElementSibling;
          dropdown?.classList.toggle('hidden');
        }}
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>

      <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center space-x-2 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-4 w-4 text-green-600" />
          <span>Export as CSV</span>
        </button>
      </div>
    </div>
  );
}
