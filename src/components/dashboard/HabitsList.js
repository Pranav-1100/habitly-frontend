// src/components/dashboard/HabitsList.js
'use client';

import { useState, useEffect } from 'react';
import { habitsApi } from '@/lib/api';
import { CircularProgressbar } from 'react-circular-progressbar';

const HabitsList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Refresh habits after completion
      await fetchHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  if (loading) {
    return <div>Loading habits...</div>;
  }

  return (
    <div className="space-y-4">
      {habits.map(habit => (
        <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={habit.completed}
              onChange={(e) => handleHabitComplete(habit.id, e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div>
              <p className="font-medium">{habit.title}</p>
              <p className="text-sm text-gray-500">{habit.streak} day streak</p>
            </div>
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
        </div>
      ))}
    </div>
  );
};

export default HabitsList;