'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { calendarApi } from '@/lib/api';

const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await calendarApi.getEvents(7);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const hasEvent = (date) => {
    return events.some(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayHasEvent = hasEvent(day);

          return (
            <div
              key={day.toString()}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                ${isToday ? 'bg-indigo-600 text-white' : ''}
                ${!isToday && dayHasEvent ? 'bg-indigo-50' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      {!loading && events.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Events</h4>
          <div className="space-y-2">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span className="text-gray-600">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;