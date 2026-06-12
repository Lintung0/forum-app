'use client';

import { Home, TrendingUp, MessageSquare, Folder, Hash, Bookmark, Bell, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menus = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Trending', icon: TrendingUp, href: '#' },
  { name: 'Discussions', icon: MessageSquare, href: '#' },
  { name: 'Categories', icon: Folder, href: '#' },
  { name: 'Tags', icon: Hash, href: '#' },
  { name: 'Bookmarks', icon: Bookmark, href: '#' },
  { name: 'Notifications', icon: Bell, href: '#', badge: 5 },
  { name: 'Messages', icon: Mail, href: '#', badge: 2 },
];

export default function Sidebar() {
  const pathname = usePathname();

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
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#e95723]' : 'text-gray-400'}`} />
              <span>{menu.name}</span>
            </div>
            {menu.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-[#e95723] text-white' : 'bg-[#e95723]/20 text-[#e95723]'
              }`}>
                {menu.badge}
              </span>
            )}
          </Link>
        );
      })}
    </aside>
  );
}