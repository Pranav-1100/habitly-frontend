'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, GripVertical } from 'lucide-react';
import { subtasksApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';

export default function SubtasksList({ taskId, onProgressChange }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    }
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      const response = await subtasksApi.getByTask(taskId);
      setSubtasks(response.data.subtasks || []);
      if (onProgressChange && response.data.progress) {
        onProgressChange(response.data.progress);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setAdding(true);
    try {
      await subtasksApi.create({
        task_id: taskId,
        title: newSubtaskTitle.trim(),
      });
      setNewSubtaskTitle('');
      await fetchSubtasks();
      toast.showSuccess('Subtask added');
    } catch (error) {
      console.error('Error adding subtask:', error);
      toast.showError('Failed to add subtask');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleComplete = async (subtaskId) => {
    try {
      await subtasksApi.toggle(subtaskId);
      await fetchSubtasks();
    } catch (error) {
      console.error('Error toggling subtask:', error);
      toast.showError('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await subtasksApi.delete(subtaskId);
      await fetchSubtasks();
      toast.showSuccess('Subtask deleted');
    } catch (error) {
      console.error('Error deleting subtask:', error);
      toast.showError('Failed to delete subtask');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const completedCount = subtasks.filter(st => st.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedCount}/{totalCount}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <button
              onClick={() => handleToggleComplete(subtask.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                subtask.completed
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              {subtask.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <span
              className={`flex-1 text-sm ${
                subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {subtask.title}
            </span>

            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Subtask */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={adding || !newSubtaskTitle.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {subtasks.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No subtasks yet. Add one to break down this task!
        </p>
      )}
    </div>
  );
}
