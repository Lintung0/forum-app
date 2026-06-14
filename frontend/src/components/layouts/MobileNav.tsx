'use client';

import React from 'react';
import { Home, MessageSquare, Bookmark, Bell, User, LayoutDashboard, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileMenus = [
  { name: 'Home', icon: Home, href: '/home' },
  { name: 'Feed', icon: MessageSquare, href: '/posts' },
  { name: 'Saves', icon: Bookmark, href: '/bookmarks' },
  { name: 'Inbox', icon: Bell, href: '/notifications' },
  { name: 'Profile', icon: User, href: '/profile' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-[#090a0f]/80 backdrop-blur-2xl border-t border-white/[0.05] px-4 py-3 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] safe-area-pb rounded-t-[2.5rem]">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {mobileMenus.map((item) => {
          const isActive = pathname === item.href || (item.href === '/profile' && pathname.startsWith('/profile'));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center gap-1.5 px-3 py-1 rounded-2xl transition-all duration-500 ${
                isActive ? 'text-[#e95723]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 w-1 h-1 bg-[#e95723] rounded-full shadow-[0_0_10px_#e95723]" />
              )}
              <item.icon className={`h-5 w-5 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-70'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${isActive ? 'opacity-100 scale-105' : 'opacity-40'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
