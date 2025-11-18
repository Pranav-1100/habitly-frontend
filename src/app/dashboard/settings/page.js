'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Moon, User, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [exporting, setExporting] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);
  }, []);

  const applyDarkMode = (enabled) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDarkModeToggle = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    applyDarkMode(enabled);
    toast.showSuccess(enabled ? 'Dark mode enabled' : 'Dark mode disabled');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportJSON = async () => {
    setExporting('json');
    try {
      const response = await exportApi.toJSON();
      const jsonString = JSON.stringify(response.data, null, 2);
      downloadFile(jsonString, `habitly-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      toast.showSuccess('Data exported to JSON successfully');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.showError('Failed to export data to JSON');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCSV = async (dataType) => {
    setExporting(dataType);
    try {
      const response = await exportApi.toCSV(dataType);
      downloadFile(response.data, `habitly-${dataType}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      toast.showSuccess(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} exported to CSV successfully`);
    } catch (error) {
      console.error(`Error exporting ${dataType} CSV:`, error);
      toast.showError(`Failed to export ${dataType} to CSV`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Profile Information</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your account information</p>
                </div>
              </div>
              <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                Edit
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage notification preferences</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => handleDarkModeToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Export</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Export All Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Download all your data in JSON format (includes habits, tasks, journal, rewards, etc.)
              </p>
              <button
                onClick={handleExportJSON}
                disabled={exporting === 'json'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                {exporting === 'json' ? 'Exporting...' : 'Export as JSON'}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                Export to CSV
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Download specific data types as CSV files for spreadsheet analysis
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportCSV('habits')}
                  disabled={exporting === 'habits'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting === 'habits' ? 'Exporting...' : 'Habits CSV'}
                </button>
                <button
                  onClick={() => handleExportCSV('tasks')}
                  disabled={exporting === 'tasks'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting === 'tasks' ? 'Exporting...' : 'Tasks CSV'}
                </button>
                <button
                  onClick={() => handleExportCSV('rewards')}
                  disabled={exporting === 'rewards'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting === 'rewards' ? 'Exporting...' : 'Rewards CSV'}
                </button>
                <button
                  onClick={() => handleExportCSV('journal')}
                  disabled={exporting === 'journal'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting === 'journal' ? 'Exporting...' : 'Journal CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Actions</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Logout</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}