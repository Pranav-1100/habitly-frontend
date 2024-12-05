'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Layout, LayoutGrid } from 'lucide-react';
import { habitsApi } from '@/lib/api';
import { CircularProgressbar } from 'react-circular-progressbar';
import HabitModal from '@/components/habits/HabitModal';
import 'react-circular-progressbar/dist/styles.css';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // grid or list

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await habitsApi.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitComplete = async (habitId, completed) => {
    try {
      await habitsApi.complete(habitId);
      await fetchHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleCreateHabit = async (data) => {
    try {
      await habitsApi.create(data);
      await fetchHabits();
      setShowNewHabitModal(false);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const filteredHabits = habits.filter(habit => 
    habit.title.toLowerCase().includes(search.toLowerCase()) ||
    habit.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header Actions */}
      <div className="mb-8 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search habits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              <Layout className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedHabit(null);
            setShowNewHabitModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Habit
        </button>
      </div>

      {/* Habits List/Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading habits...</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits found</h3>
          <p className="text-gray-600">Create your first habit to get started</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map(habit => (
            <div
              key={habit.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{habit.title}</h3>
                  <p className="text-sm text-gray-600">{habit.description}</p>
                </div>
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={habit.streak * 10}
                    text={`${habit.streak}`}
                    styles={{
                      path: { stroke: '#6366F1' },
                      text: { fill: '#6366F1', fontSize: '24px' }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Frequency: {habit.frequency}</p>
                  <p className="text-sm text-gray-600">{habit.streak} day streak</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedHabit(habit);
                      setShowNewHabitModal(true);
                    }}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={(e) => handleHabitComplete(habit.id, e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={(e) => handleHabitComplete(habit.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{habit.title}</h3>
                  <p className="text-sm text-gray-600">{habit.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Frequency: {habit.frequency}</p>
                  <p className="text-sm text-gray-600">{habit.streak} day streak</p>
                </div>
                <div className="w-12 h-12">
                  <CircularProgressbar
                    value={habit.streak * 10}
                    text={`${habit.streak}`}
                    styles={{
                      path: { stroke: '#6366F1' },
                      text: { fill: '#6366F1', fontSize: '24px' }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedHabit(habit);
                    setShowNewHabitModal(true);
                  }}
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Habit Modal */}
      {showNewHabitModal && (
        <HabitModal
          isOpen={showNewHabitModal}
          onClose={() => {
            setShowNewHabitModal(false);
            setSelectedHabit(null);
          }}
          onSubmit={handleCreateHabit}
          initialData={selectedHabit}
        />
      )}
    </div>
  );
}