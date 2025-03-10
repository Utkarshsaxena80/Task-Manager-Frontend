import React from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: number;
  owner: string;
}

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: number) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onEdit: (taskId: number, title: string, description: string) => Promise<void>;
}

export function TaskList({ tasks, onComplete, onDelete, onEdit }: TaskListProps) {
  const handleEdit = async (task: Task) => {
    const newTitle = prompt('Enter new title:', task.title);
    const newDescription = prompt('Enter new description:', task.description);
    
    if (newTitle && newDescription) {
      await onEdit(task.id, newTitle, newDescription);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white p-6 rounded-lg shadow-md ${
            task.status === 1 ? 'opacity-75' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${
                task.status === 1 ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              <p className={`mt-1 text-sm ${
                task.status === 1 ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {task.description}
              </p>
            </div>
            <div className="flex space-x-2">
              {task.status === 0 && (
                <>
                  <button
                    onClick={() => onComplete(task.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No tasks found. Add a new task to get started!</p>
        </div>
      )}
    </div>
  );
}