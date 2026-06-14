'use client';

import React from 'react';
import { TrendingUp, MessageSquare, Bookmark, Bell, ShieldAlert, Users, LayoutDashboard, FileText, Flag, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menus: { name: string; icon: React.ElementType; href: string }[] = [
  { name: 'Trending', icon: TrendingUp, href: '/home' },
  { name: 'Discussions', icon: MessageSquare, href: '/posts' },
  { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
];

const adminLinks: { name: string; icon: React.ElementType; href: string }[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Users', icon: UserCog, href: '/admin/users' },
  { name: 'Categories', icon: FileText, href: '/admin/categories' },
  { name: 'Reports', icon: Flag, href: '/admin/reports' },
];

const modLinks: { name: string; icon: React.ElementType; href: string }[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/moderator' },
  { name: 'Reports', icon: Flag, href: '/moderator/reports' },
];

function SidebarIcon({ name, icon: Icon, href, active }: { name: string; icon: React.ElementType; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      title={name}
      className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
        active
          ? 'bg-[#e95723] text-white shadow-lg shadow-[#e95723]/20'
          : 'text-gray-500 hover:bg-[#1a1d24] hover:text-white'
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1a1d24] border border-[#2a2d35] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        {name}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user') || localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const roles: string[] = (u?.roles ?? (u?.role ? [u.role] : []))
        .map((r: any) => (typeof r === 'string' ? r : r?.name ?? '').toLowerCase());
      setIsAdmin(roles.includes('admin'));
      setIsModerator(roles.includes('moderator') || roles.includes('admin'));
    } catch {}
  }, []);

  return (
    <aside className="w-16 shrink-0 h-[calc(100vh-64px)] sticky top-16 hidden lg:flex flex-col items-center border-r border-[#1e2129] bg-[#0b0d10] py-4 gap-1.5 overflow-y-auto">
      {menus.map((item) => (
        <SidebarIcon key={item.name} {...item} active={pathname === item.href} />
      ))}

      {(isAdmin || isModerator) && (
        <>
          <div className="w-6 h-px bg-[#1e2129] my-2" />

          {isAdmin && adminLinks.map((item) => (
            <SidebarIcon key={item.name} {...item} active={pathname === item.href} />
          ))}

          {isModerator && !isAdmin && modLinks.map((item) => (
            <SidebarIcon key={item.name} {...item} active={pathname === item.href} />
          ))}
        </>
      )}
    </aside>
  );
}
