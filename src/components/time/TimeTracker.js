'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { timeApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';

export default function TimeTracker({ entityType, entityId, entityTitle }) {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    checkActiveTimer();
    const interval = setInterval(() => {
      if (activeTimer) {
        const started = new Date(activeTimer.start_time).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - started) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const checkActiveTimer = async () => {
    try {
      const response = await timeApi.getActive();
      const active = response.data.activeLogs?.find(
        (t) => t.entity_type === entityType && t.entity_id === entityId
      );
      setActiveTimer(active || null);
    } catch (error) {
      console.error('Error checking active timer:', error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await timeApi.start({
        entity_type: entityType,
        entity_id: entityId,
      });
      toast.showSuccess('Timer started');
      await checkActiveTimer();
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.showError('Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeTimer) return;

    setLoading(true);
    try {
      await timeApi.stop(activeTimer.id);
      toast.showSuccess(`Timer stopped. Total: ${formatTime(elapsed)}`);
      setActiveTimer(null);
      setElapsed(0);
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.showError('Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-600" />
          <div>
            <h4 className="font-medium text-gray-900">Time Tracker</h4>
            {entityTitle && (
              <p className="text-xs text-gray-600">{entityTitle}</p>
            )}
          </div>
        </div>

        {activeTimer ? (
          <div className="flex items-center gap-3">
            <div className="text-2xl font-mono font-bold text-purple-600">
              {formatTime(elapsed)}
            </div>
            <button
              onClick={handleStop}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Timer
          </button>
        )}
      </div>

      {activeTimer && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Recording time...</span>
        </div>
      )}
    </div>
  );
}
