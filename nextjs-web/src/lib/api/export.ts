import apiClient from './client';

export const exportApi = {
  // Export user tasks as CSV
  exportTasksCSV: async (userId: number): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/tasks/export/csv`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/csv',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export tasks');
    }
    
    return response.blob();
  },

  // Export user tasks as JSON
  exportTasksJSON: async (userId: number): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/tasks/export/json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export tasks');
    }
    
    return response.blob();
  },

  // Client-side CSV export (backup method)
  exportTasksClientSide: (tasks: any[], filename: string = 'my_tasks.csv') => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Deadline', 'Created Date'];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.status,
        task.priority,
        task.category?.name || '',
        task.deadline || '',
        new Date(task.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};