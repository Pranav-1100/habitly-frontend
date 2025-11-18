'use client';

// src/components/habits/HabitModal.js
import { useState, useEffect } from 'react';
import { X, StickyNote, Clock, Snowflake } from 'lucide-react';
import NotesPanel from '../notes/NotesPanel';
import TimeTracker from '../time/TimeTracker';
import FreezeButton from '../freezes/FreezeButton';

export default function HabitModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        frequency: initialData.frequency || 'daily'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        frequency: 'daily'
      });
      setActiveTab('details');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency
      });
      if (!initialData) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs (only for editing) */}
        {initialData && (
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'notes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'time'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Time
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      setError('');
                    }}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter habit name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    placeholder="Enter habit description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                  </select>
                </div>

                {/* Freeze Button (only for editing) */}
                {initialData && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-3">Streak Protection</label>
                    <FreezeButton habitId={initialData.id} habitTitle={formData.title} />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : initialData ? 'Update Habit' : 'Create Habit'}
                  </button>
                </div>
              </form>
            </>
          ) : activeTab === 'notes' ? (
            <NotesPanel
              entityType="habit"
              entityId={initialData?.id}
              entityTitle={formData.title}
            />
          ) : (
            <div className="space-y-6">
              <TimeTracker
                entityType="habit"
                entityId={initialData?.id}
                entityTitle={formData.title}
              />

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Time Tracking Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Start the timer when you begin working on this habit</li>
                  <li>• Stop it when you're done to track your time</li>
                  <li>• View your time logs in the analytics section</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}