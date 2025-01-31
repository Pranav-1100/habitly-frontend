'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Calendar, CheckSquare, Target, Settings, Bell, User } from 'lucide-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { analyticsApi, tasksApi, habitsApi } from '@/lib/api';
import Link from 'next/link';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import 'react-circular-progressbar/dist/styles.css';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState({
    productivityScore: null,
    weeklyComparison: null
  });
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [habitsResponse, tasksResponse] = await Promise.all([
        habitsApi.getAll(),
        tasksApi.getAll()
      ]);

      setHabits(habitsResponse.data || []);
      setTasks(tasksResponse.data || []);

      // Fetch analytics separately
      try {
        const [productivityScore, weeklyComparison] = await Promise.all([
          analyticsApi.getProductivityScore(),
          analyticsApi.getWeeklyComparison()
        ]);

        setAnalytics({
          productivityScore: productivityScore.data,
          weeklyComparison: weeklyComparison.data
        });
      } catch (analyticsError) {
        console.error('Analytics fetch error:', analyticsError);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHabitComplete = async (habitId, completed) => {
    try {
      await habitsApi.complete(habitId);
      const response = await habitsApi.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleTaskComplete = async (taskId, completed) => {
    try {
      await tasksApi.complete(taskId, { completed });
      const response = await tasksApi.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Habitly</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
              <Home className="w-5 h-5 mr-4" />
              Dashboard
            </Link>
            <Link href="/dashboard/tasks" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              <CheckSquare className="w-5 h-5 mr-4" />
              Tasks
            </Link>
            <Link href="/dashboard/habits" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 mr-4" />
              Habits
            </Link>
            <Link href="/dashboard/calendar" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 mr-4" />
              Calendar
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 mr-4" />
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <User className="w-5 h-5" />
        </div>
        <span className="font-medium"></span>
      </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* First panel - Line chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Productivity Score</h3>
                <p className="text-sm text-gray-500">Weekly performance</p>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.weeklyComparison?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366F1" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Second panel - Mini Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <MiniCalendar />
            </div>

            {/* Third panel - Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Today's Overview</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Habits Completed</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(habits.filter(h => h.completed).length / habits.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-sm font-medium">
                      {habits.filter(h => h.completed).length}/{habits.length}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tasks Completed</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-sm font-medium">
                      {tasks.filter(t => t.completed).length}/{tasks.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Tasks */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Tasks</h3>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer" 
                      />
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-sm text-gray-500">
                            {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Habits */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Habits</h3>
              <div className="space-y-4">
                {habits.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={habit.completed}
                        onChange={(e) => handleHabitComplete(habit.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer" 
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;