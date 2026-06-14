'use client';

import React from 'react';
import { TrendingUp, MessageSquare, Bookmark, Bell, ShieldAlert, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menus: { name: string; icon: React.ElementType; href: string }[] = [
  { name: 'Trending', icon: TrendingUp, href: '/home' },
  { name: 'Discussions', icon: MessageSquare, href: '/posts' },
  { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [modOpen, setModOpen] = React.useState(false);

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
    <aside className="w-[180px] shrink-0 h-[calc(100vh-64px)] sticky top-16 hidden lg:flex flex-col border-r border-[#1e2129] bg-[#0b0d10] overflow-y-auto">
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {menus.map(({ name, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? 'bg-[#1e0f09] text-[#e95723] border border-[#3d1a0a]'
                  : 'text-gray-400 hover:bg-[#13151a] hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#e95723]' : 'text-gray-500'}`} />
              {name}
            </Link>
          );
        })}

        {(isAdmin || isModerator) && (
          <div className="pt-3 mt-2 border-t border-[#1e2129]">
            <p className="px-3 pb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Panel</p>

            {isAdmin && (
              <div>
                <button
                  onClick={() => setAdminOpen((s) => !s)}
                  className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-[#13151a] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-gray-500" />
                    Admin
                  </div>
                  <span className="text-gray-600 text-xs">{adminOpen ? '▾' : '▸'}</span>
                </button>
                {adminOpen && (
                  <div className="pl-9 space-y-0.5">
                    {[['Overview', '/admin'], ['Users', '/admin/users'], ['Categories', '/admin/categories'], ['Reports', '/admin/reports']].map(([label, href]) => (
                      <Link key={href} href={href} className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#13151a]">{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isModerator && (
              <div>
                <button
                  onClick={() => setModOpen((s) => !s)}
                  className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-[#13151a] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 shrink-0 text-gray-500" />
                    Moderator
                  </div>
                  <span className="text-gray-600 text-xs">{modOpen ? '▾' : '▸'}</span>
                </button>
                {modOpen && (
                  <div className="pl-9 space-y-0.5">
                    {[['Overview', '/moderator'], ['Reports', '/moderator/reports']].map(([label, href]) => (
                      <Link key={href} href={href} className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#13151a]">{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
