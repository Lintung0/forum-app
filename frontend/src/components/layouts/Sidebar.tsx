'use client';

import React from 'react';
import { TrendingUp, MessageSquare, Bookmark, Bell, LayoutDashboard, FileText, Flag, UserCog, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menus = [
  { name: 'Trending', icon: TrendingUp, href: '/home' },
  { name: 'Feed', icon: MessageSquare, href: '/posts' },
  { name: 'Saves', icon: Bookmark, href: '/bookmarks' },
  { name: 'Inbox', icon: Bell, href: '/notifications' },
];

const adminLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Users', icon: UserCog, href: '/admin/users' },
  { name: 'Categories', icon: FileText, href: '/admin/categories' },
  { name: 'Reports', icon: Flag, href: '/admin/reports' },
];

const moderatorLinks = [
  { name: 'Reports', icon: Flag, href: '/moderator/reports' },
  { name: 'Manage Posts', icon: MessageSquare, href: '/moderator/posts' },
  { name: 'Manage Comments', icon: FileText, href: '/moderator/comments' },
];

function SidebarItem({ name, icon: Icon, href, active }: { name: string; icon: React.ElementType; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
        active
          ? "bg-[#e95723] text-white shadow-lg shadow-[#e95723]/10"
          : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
      )}
    >
      <Icon className={cn("h-4.5 w-4.5", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
      <span className="text-[13px] font-bold tracking-tight">{name}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(false);

  React.useEffect(() => {
    setIsAdmin(false); 
    setIsModerator(false);

    try {
      const raw = localStorage.getItem('auth_user') || localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const roles: string[] = (u?.roles ?? (u?.role ? [u.role] : []))
        .map((r: any) => (typeof r === 'string' ? r : r?.name ?? '').toLowerCase());
      setIsAdmin(roles.includes('admin'));
      setIsModerator(roles.includes('moderator') || roles.includes('admin'));
    } catch {
      
      setIsAdmin(false);
      setIsModerator(false);
    }
  }, [pathname]); 

  return (
    <aside className="w-[192px] shrink-0 h-[calc(100vh-80px)] sticky top-20 hidden lg:flex flex-col border-r border-white/[0.05] bg-transparent py-4 pr-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Main Menu</p>
          <nav className="space-y-1">
            {menus.map((item) => (
              <SidebarItem key={item.name} {...item} active={pathname === item.href} />
            ))}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-black text-[#e95723] uppercase tracking-widest">Admin Panel</p>
            <nav className="space-y-1">
              {adminLinks.map((item) => (
                <SidebarItem key={item.name} {...item} active={pathname === item.href} />
              ))}
            </nav>
          </div>
        )}

        {isModerator && !isAdmin && ( 
          <div>
            <p className="px-3 mb-2 text-[10px] font-black text-[#e95723] uppercase tracking-widest">Moderator Panel</p>
            <nav className="space-y-1">
              {moderatorLinks.map((item) => (
                <SidebarItem key={item.name} {...item} active={pathname === item.href} />
              ))}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
