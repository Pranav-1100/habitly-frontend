'use client';

import { Home, Calendar, CheckSquare, Target, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ErrorBoundary from '../ErrorBoundary';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Tasks', icon: CheckSquare, href: '/dashboard/tasks' },
    { name: 'Habits', icon: Target, href: '/dashboard/habits' },
    { name: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Habitly</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                  pathname === item.href
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600"></span>
                </div>
                <span className="font-medium"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <ErrorBoundary>
            <div className="p-8">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}