'use client';

import { useState, useEffect } from 'react';
import { Snowflake } from 'lucide-react';
import { freezesApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import { format } from 'date-fns';

export default function FreezeButton({ habitId, habitTitle }) {
  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [freezeDate, setFreezeDate] = useState('');
  const [reason, setReason] = useState('');
  const toast = useToast();

  useEffect(() => {
    checkAvailable();
  }, []);

  const checkAvailable = async () => {
    try {
      const response = await freezesApi.getAvailable();
      setAvailable(response.data);
    } catch (error) {
      console.error('Error checking freeze availability:', error);
    }
  };

  const handleFreeze = async () => {
    if (!freezeDate) {
      toast.showWarning('Please select a date to freeze');
      return;
    }

    setLoading(true);
    try {
      await freezesApi.create({
        habit_id: habitId,
        freeze_date: freezeDate,
        reason: reason.trim() || undefined,
      });
      toast.showSuccess('Streak frozen for selected date');
      setShowModal(false);
      setFreezeDate('');
      setReason('');
      await checkAvailable();
    } catch (error) {
      console.error('Error freezing streak:', error);
      toast.showError(error.response?.data?.error || 'Failed to freeze streak');
    } finally {
      setLoading(false);
    }
  };

  const canFreeze = available && available.remaining > 0;

  return (
    <>
      <button
        onClick={() => {
          if (canFreeze) {
            setShowModal(true);
          } else {
            toast.showWarning('No freeze days available this week (2 max)');
          }
        }}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
          canFreeze
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!canFreeze}
        title={
          canFreeze
            ? `${available.remaining}/2 freeze days available this week`
            : 'No freeze days available'
        }
      >
        <Snowflake className="w-4 h-4" />
        Freeze ({available?.remaining || 0}/2)
      </button>

      {/* Freeze Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Snowflake className="w-6 h-6 text-blue-600" />
              Freeze Streak
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Protect your streak for a day when you can't complete "{habitTitle}".
              You have <strong>{available.remaining}/2</strong> freeze days available this week.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date to Freeze <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={freezeDate}
                  onChange={(e) => setFreezeDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Why are you freezing this day?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFreezeDate('');
                  setReason('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleFreeze}
                disabled={loading || !freezeDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Snowflake className="w-4 h-4" />
                {loading ? 'Freezing...' : 'Freeze Streak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
