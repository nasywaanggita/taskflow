'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  Circle,
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { updateTask, deleteTask } = useTaskStore();

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    todo: Circle,
    in_progress: PlayCircle,
    done: CheckCircle2,
  };

  const handleStatusChange = async () => {
    const statusFlow = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    } as const;

    await updateTask(task.id, { status: statusFlow[task.status] });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleStatusChange}
            className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <StatusIcon className={`h-5 w-5 ${
              task.status === 'done' ? 'text-green-600' : 
              task.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium text-gray-900 ${
              task.status === 'done' ? 'line-through opacity-75' : ''
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onEdit?.(task);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {/* Category */}
          {task.category && (
            <div className="flex items-center space-x-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.category.color }}
              />
              <span className="text-gray-600">{task.category.name}</span>
            </div>
          )}

          {/* Priority */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(task.deadline), 'MMM dd')}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Created {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
        </div>
        
        {task.reminder_sent_at && (
          <div className="flex items-center space-x-1 text-blue-600">
            <span>🔔</span>
            <span>Reminded</span>
          </div>
        )}
      </div>
    </div>
  );
}