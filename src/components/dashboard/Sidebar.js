'use client';

import { Home, Calendar, CheckSquare, Target, Settings, Trophy, BookOpen, Tag, FolderKanban, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Tasks', icon: CheckSquare, href: '/dashboard/tasks' },
    { name: 'Habits', icon: Target, href: '/dashboard/habits' },
    { name: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { name: 'Templates', icon: FolderKanban, href: '/dashboard/templates' },
    { name: 'Categories', icon: Tag, href: '/dashboard/categories' },
    { name: 'Journal', icon: BookOpen, href: '/dashboard/journal' },
    { name: 'Rewards', icon: Trophy, href: '/dashboard/rewards' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-full">
      <div className="p-6">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors">
            Habitly
          </h1>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Track, Build, Achieve</p>
      </div>
      <nav className="mt-2">
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Version 1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
