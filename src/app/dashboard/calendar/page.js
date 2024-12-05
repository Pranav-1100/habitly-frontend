'use client';

// src/app/dashboard/calendar/page.js
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { calendarApi, tasksApi, habitsApi } from '@/lib/api';
import { Settings, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskModal from '@/components/tasks/TaskModal';
import HabitModal from '@/components/habits/HabitModal';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [tasksRes, habitsRes] = await Promise.all([
        tasksApi.getAll(),
        habitsApi.getAll()
      ]);

      // Convert tasks to calendar events
      const taskEvents = tasksRes.data.map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        start: new Date(task.due_date),
        end: new Date(task.due_date),
        type: 'task',
        priority: task.priority,
        completed: task.completed
      }));

      // Convert habits to calendar events
      const habitEvents = habitsRes.data.map(habit => ({
        id: `habit-${habit.id}`,
        title: habit.title,
        start: new Date(),
        end: new Date(),
        type: 'habit',
        frequency: habit.frequency,
        completed: habit.completed
      }));

      setEvents([...taskEvents, ...habitEvents]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#6366F1',
      borderRadius: '8px'
    };

    if (event.type === 'task') {
      style.backgroundColor = event.priority === 'high' ? '#EF4444' : 
                            event.priority === 'medium' ? '#F59E0B' : '#10B981';
    }

    if (event.completed) {
      style.opacity = 0.6;
    }

    return { style };
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600">Manage your tasks and habits</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
          <button
            onClick={() => setShowHabitModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg border border-gray-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div style={{ height: 700 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={async (data) => {
            await tasksApi.create(data);
            await fetchEvents();
            setShowTaskModal(false);
          }}
        />
      )}

      {showHabitModal && (
        <HabitModal
          isOpen={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          onSubmit={async (data) => {
            await habitsApi.create(data);
            await fetchEvents();
            setShowHabitModal(false);
          }}
        />
      )}
    </div>
  );
}