'use client';

import React from 'react';
import {
  TrendingUp,
  MessageSquare,
  Folder,
  Hash,
  Bookmark,
  Bell,
  Mail,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menus: { name: string; icon: React.ElementType; href: string; badge?: string }[] = [
  { name: 'Trending', icon: TrendingUp, href: '/home' },
  { name: 'Discussions', icon: MessageSquare, href: '/posts' },
  { name: 'Categories', icon: Folder, href: '#' },
  { name: 'Tags', icon: Hash, href: '#' },
  { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
  { name: 'Messages', icon: Mail, href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isModerator, setIsModerator] = React.useState(false);
  const [isModeratorOpen, setIsModeratorOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  React.useEffect(() => {
      try {
        const raw = typeof window !== 'undefined' ? (localStorage.getItem('auth_user') || localStorage.getItem('user')) : null;
        if (!raw) { setIsModerator(false); setIsAdmin(false); return; }
        const u = JSON.parse(raw);
        const roles = u?.roles || (u.role ? (Array.isArray(u.role) ? u.role : [u.role]) : []);
        const roleNames = Array.isArray(roles) ? roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : (r.name || r.role || '').toString().toLowerCase())) : [];
        setIsModerator(roleNames.includes('moderator') || roleNames.includes('admin'));
        setIsAdmin(roleNames.includes('admin'));
      } catch (e) {
        setIsModerator(false);
        setIsAdmin(false);
      }
  }, []);

  return (
    <aside className="w-64 h-[calc(100vh-64px)] sticky top-16 hidden lg:block border-r border-[#1e2129] bg-[#0f1115] p-4 space-y-2">
      {menus.map((menu) => {
        const isActive = pathname === menu.href;
        const Icon = menu.icon;

        return (
          <Link
            key={menu.name}
            href={menu.href}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[#2c1a14] to-[#16181d] text-[#e95723] border border-[#442318]'
                : 'text-gray-400 hover:bg-[#16181d] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-[#e95723]' : 'text-gray-400'
                }`}
              />
              <span>{menu.name}</span>
            </div>

            {menu.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#e95723] text-white'
                    : 'bg-[#e95723]/20 text-[#e95723]'
                }`}
              >
                {menu.badge}
              </span>
            )}
          </Link>
        );
      })}
      {  }
      {isAdmin && (
        <div className="space-y-1">
          <button
            onClick={() => setIsAdminOpen((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-400 hover:bg-[#16181d] hover:text-white"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-gray-400" />
              <span>Admin Panel</span>
            </div>
            <span className="text-gray-400">{isAdminOpen ? '▾' : '▸'}</span>
          </button>

          {isAdminOpen && (
            <div className="pl-10 pr-4 space-y-1">
              <Link href="/admin" className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-[#16181d]">Overview</Link>
              <Link href="/admin/users" className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-[#16181d]">Kelola Users</Link>
            </div>
          )}
        </div>
      )}

      {isModerator && (
        <div className="space-y-1">
          <button
            onClick={() => setIsModeratorOpen((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-400 hover:bg-[#16181d] hover:text-white"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <span>Moderator Panel</span>
            </div>
            <span className="text-gray-400">{isModeratorOpen ? '▾' : '▸'}</span>
          </button>

          {isModeratorOpen && (
            <div className="pl-10 pr-4 space-y-1">
              <Link href="/moderator" className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-[#16181d]">Overview</Link>
              <Link href="/moderator/reports" className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-[#16181d]">Reports</Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
