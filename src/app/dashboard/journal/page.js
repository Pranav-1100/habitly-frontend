'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react';
import { journalApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import { format, subDays, addDays } from 'date-fns';

const MOODS = [
  { emoji: '😄', label: 'Great', value: 'great', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { emoji: '😊', label: 'Good', value: 'good', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { emoji: '😔', label: 'Bad', value: 'bad', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { emoji: '😢', label: 'Awful', value: 'awful', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
];

export default function JournalPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entry, setEntry] = useState(null);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchEntry(currentDate);
    fetchRecentEntries();
  }, [currentDate]);

  const fetchEntry = async (date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await journalApi.getByDate(dateStr);
      if (response.data) {
        setEntry(response.data);
        setContent(response.data.content || '');
        setMood(response.data.mood || '');
      } else {
        setEntry(null);
        setContent('');
        setMood('');
      }
    } catch (error) {
      // Entry doesn't exist - that's okay
      setEntry(null);
      setContent('');
      setMood('');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const response = await journalApi.getRecent(5);
      setRecentEntries(response.data);
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    }
  };

  const handleSave = async () => {
    if (!content.trim() && !mood) {
      toast.showWarning('Please add some content or select a mood');
      return;
    }

    setSaving(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const data = { date: dateStr, content, mood };

      if (entry) {
        await journalApi.update(dateStr, data);
        toast.showSuccess('Journal entry updated');
      } else {
        await journalApi.create(data);
        toast.showSuccess('Journal entry saved');
      }

      await fetchEntry(currentDate);
      await fetchRecentEntries();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.showError('Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      await journalApi.delete(dateStr);
      toast.showSuccess('Journal entry deleted');
      setEntry(null);
      setContent('');
      setMood('');
      await fetchRecentEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.showError('Failed to delete journal entry');
    }
  };

  const navigateDate = (days) => {
    setCurrentDate(days > 0 ? addDays(currentDate, days) : subDays(currentDate, Math.abs(days)));
  };

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
        </div>
        <p className="text-gray-600">Reflect on your day and track your mood</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Journal Entry */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Date Navigator */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {format(currentDate, 'MMMM d, yyyy')}
                </h2>
                {isToday && (
                  <span className="text-sm text-indigo-600 font-medium">Today</span>
                )}
              </div>

              <button
                onClick={() => navigateDate(1)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                disabled={isToday}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mood Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                How are you feeling?
              </label>
              <div className="flex gap-3 justify-center">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      mood === m.value
                        ? `${m.color} scale-110 shadow-lg`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl mb-1">{m.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Journal Entry
              </label>
              {loading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Write about your day, your thoughts, your achievements..."
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
              </button>
              {entry && (
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Entries */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Recent Entries
            </h3>

            {recentEntries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No journal entries yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((recentEntry) => {
                  const entryMood = MOODS.find(m => m.value === recentEntry.mood);
                  const entryDate = new Date(recentEntry.date);
                  const isCurrentEntry = format(entryDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

                  return (
                    <button
                      key={recentEntry.id}
                      onClick={() => setCurrentDate(entryDate)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isCurrentEntry
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {format(entryDate, 'MMM d, yyyy')}
                        </span>
                        {entryMood && (
                          <span className="text-xl">{entryMood.emoji}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {recentEntry.content || 'No content'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-6 bg-indigo-50 rounded-lg border border-indigo-200 p-4">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">💡 Journaling Tips</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• Write about wins, big or small</li>
              <li>• Reflect on challenges & learnings</li>
              <li>• Express gratitude</li>
              <li>• Set intentions for tomorrow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
